import express from 'express';
import { getAuthUrl, getTokensFromCode, setCredentials } from '../config/google.config.js';
import { supabase } from '../config/supabase.config.js';
import { google } from 'googleapis';

const router = express.Router();

/**
 * GET /api/auth/url
 * Retorna URL de autenticação do Google
 * Aceita parâmetro opcional 'redirect_uri' para suportar acesso pela rede interna
 */
router.get('/url', (req, res) => {
  try {
    // IMPORTANTE: Google OAuth não aceita IPs privados (192.168.x.x)
    // Sempre usar localhost para o redirect_uri
    const backendPort = process.env.BACKEND_PORT || 4000;
    const redirectUri = `http://localhost:${backendPort}/api/auth/callback`;
    
    // Detectar URL do frontend original para redirecionar corretamente após auth
    const frontendOrigin = req.get('origin') || req.get('referer') || process.env.FRONTEND_URL || 'http://localhost:3000';
    let frontendUrl = frontendOrigin;
    let isNetworkAccess = false;
    
    try {
      const originUrl = new URL(frontendOrigin);
      frontendUrl = `${originUrl.protocol}//${originUrl.host}`;
      
      // Verificar se está acessando pela rede (não localhost)
      isNetworkAccess = !originUrl.hostname.includes('localhost') && 
                        !originUrl.hostname.includes('127.0.0.1') &&
                        originUrl.hostname !== '::1';
      
      if (isNetworkAccess) {
        console.warn('⚠️  ATENÇÃO: Acesso pela rede detectado!');
        console.warn('⚠️  O Google vai redirecionar para localhost, que só funciona no servidor.');
        console.warn('💡 SOLUÇÃO: Após autenticar no Google, copie a URL completa do callback');
        console.warn('💡 e acesse diretamente no servidor (ou use ngrok para túnel público)');
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível parsear origin:', e.message);
    }
    
    // Adicionar o frontend_url como parâmetro na URL de auth para usar no callback
    const authUrl = getAuthUrl(redirectUri, frontendUrl);
    
    console.log('✅ Usando redirect_uri (sempre localhost):', redirectUri);
    console.log('📍 Frontend original:', frontendUrl);
    
    res.json({ 
      authUrl, 
      redirectUri,
      warning: isNetworkAccess ? 'Acesso pela rede detectado. Após autenticar, copie a URL do callback e acesse no servidor.' : null
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação:', error);
    res.status(500).json({ error: 'Falha ao gerar URL de autenticação' });
  }
});

/**
 * GET /api/auth/callback
 * Callback após autenticação no Google
 */
router.get('/callback', async (req, res) => {
  const { code, error: authError, state } = req.query;

  console.log('=== CALLBACK DE AUTENTICAÇÃO ===');
  console.log('Code recebido:', code ? 'SIM' : 'NÃO');
  console.log('Erro do Google:', authError || 'NENHUM');
  console.log('State recebido:', state || 'NENHUM');

  // Decodificar state para obter frontendUrl original
  let frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  if (state) {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      if (stateData.frontendUrl) {
        frontendUrl = stateData.frontendUrl;
        console.log('📍 Frontend URL do state:', frontendUrl);
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível decodificar state:', e.message);
    }
  }

  if (authError) {
    console.error('Erro retornado pelo Google:', authError);
    return res.redirect(`${frontendUrl}?auth=error&reason=${authError}`);
  }

  if (!code) {
    console.error('Código de autenticação não fornecido');
    return res.redirect(`${frontendUrl}?auth=error&reason=no_code`);
  }

  try {
    // SEMPRE usar localhost para o redirect_uri (Google não aceita IPs privados)
    const backendPort = process.env.BACKEND_PORT || 4000;
    const redirectUri = `http://localhost:${backendPort}/api/auth/callback`;
    
    console.log('✅ Usando redirect_uri (localhost):', redirectUri);
    
    // Criar cliente OAuth2 com redirect_uri localhost
    const oauth2ClientForToken = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    
    const tokenResponse = await oauth2ClientForToken.getToken(code);
    const tokens = tokenResponse.tokens;
    setCredentials(tokens);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Validar configuração do Supabase antes de usar
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      console.error('❌ ERRO: Variáveis do Supabase não configuradas!');
      console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurado' : '❌ Faltando');
      console.error('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurado' : '❌ Faltando');
      throw new Error('Configuração do Supabase incompleta. Verifique as variáveis de ambiente.');
    }

    console.log('💾 Tentando salvar usuário no Supabase...');
    console.log('📧 Email:', userInfo.email);
    console.log('🆔 Google ID:', userInfo.id);

    const { data: user, error: dbError } = await supabase
      .from('users')
      .upsert({
        google_id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : null
      }, {
        onConflict: 'google_id'
      })
      .select()
      .single();

    if (dbError) {
      console.error('❌ Erro ao salvar no banco:');
      console.error('Mensagem:', dbError.message);
      console.error('Detalhes:', dbError.details);
      console.error('Hint:', dbError.hint);
      console.error('Code:', dbError.code);
      
      // Se for erro de conexão, dar mensagem mais clara
      if (dbError.message && dbError.message.includes('fetch failed')) {
        console.error('🔍 Diagnóstico: Erro de conexão com Supabase');
        console.error('💡 Verifique:');
        console.error('   1. SUPABASE_URL está correto?');
        console.error('   2. SUPABASE_SERVICE_KEY está correto?');
        console.error('   3. Há firewall bloqueando?');
        console.error('   4. O Supabase está acessível?');
      }
      
      throw dbError;
    }
    
    console.log('Usuário salvo com sucesso:', user.id);

    // Salvar na sessão
    req.session.userId = user.id;
    req.session.googleId = userInfo.id;
    req.session.tokens = tokens;

    console.log('Sessão criada com sucesso');

    // Redirecionar para o frontend (já definido acima do try)
    console.log('Redirecionando para:', frontendUrl);
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('=== ERRO NO CALLBACK ===');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    res.redirect(`${frontendUrl}?auth=error&reason=callback_failed`);
  }
});

/**
 * GET /api/auth/status
 * Verifica status de autenticação
 */
router.get('/status', async (req, res) => {
  if (!req.session.userId) {
    return res.json({ authenticated: false });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, google_id')
      .eq('id', req.session.userId)
      .single();

    if (error) throw error;

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ error: 'Falha ao verificar status de autenticação' });
  }
});

/**
 * POST /api/auth/logout
 * Faz logout do usuário
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao fazer logout:', err);
      return res.status(500).json({ error: 'Falha ao fazer logout' });
    }
    res.json({ success: true });
  });
});

export default router;
