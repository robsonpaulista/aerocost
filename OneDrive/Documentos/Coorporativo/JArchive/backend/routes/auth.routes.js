import express from 'express';
import { getAuthUrl, getTokensFromCode, setCredentials } from '../config/google.config.js';
import { supabase } from '../config/supabase.config.js';
import { google } from 'googleapis';

const router = express.Router();

/**
 * GET /api/auth/url
 * Retorna URL de autenticação do Google
 */
router.get('/url', (req, res) => {
  try {
    const authUrl = getAuthUrl();
    res.json({ authUrl });
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
  const { code, error: authError } = req.query;

  console.log('=== CALLBACK DE AUTENTICAÇÃO ===');
  console.log('Code recebido:', code ? 'SIM' : 'NÃO');
  console.log('Erro do Google:', authError || 'NENHUM');

  if (authError) {
    console.error('Erro retornado pelo Google:', authError);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}?auth=error&reason=${authError}`);
  }

  if (!code) {
    console.error('Código de autenticação não fornecido');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}?auth=error&reason=no_code`);
  }

  try {
    const tokens = await getTokensFromCode(code);
    setCredentials(tokens);

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

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
      console.error('Erro ao salvar no banco:', dbError);
      throw dbError;
    }
    
    console.log('Usuário salvo com sucesso:', user.id);

    // Salvar na sessão
    req.session.userId = user.id;
    req.session.googleId = userInfo.id;
    req.session.tokens = tokens;

    console.log('Sessão criada com sucesso');

    // Redirecionar para o frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('Redirecionando para:', frontendUrl);
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error) {
    console.error('=== ERRO NO CALLBACK ===');
    console.error('Tipo:', error.constructor.name);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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
