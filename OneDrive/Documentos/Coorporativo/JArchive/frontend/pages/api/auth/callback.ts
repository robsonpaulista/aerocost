import type { NextApiRequest, NextApiResponse } from 'next';
import { getTokensFromCode } from '../../../lib/api-server/google.config';
import { supabase } from '../../../lib/api-server/supabase.config';
import { google } from 'googleapis';
import { getFrontendUrl } from '../../../lib/api-server/utils';

/**
 * GET /api/auth/callback
 * Callback após autenticação no Google
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { code, error: authError, state } = req.query;

  // Decodificar state para obter frontendUrl original
  let frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  if (state && typeof state === 'string') {
    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      if (stateData.frontendUrl) {
        frontendUrl = stateData.frontendUrl;
      }
    } catch (e) {
      // Ignorar erro
    }
  }

  if (authError) {
    return res.redirect(`${frontendUrl}?auth=error&reason=${authError}`);
  }

  if (!code || typeof code !== 'string') {
    return res.redirect(`${frontendUrl}?auth=error&reason=no_code`);
  }

  try {
    // Obter URL base para redirect_uri
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    
    const redirectUri = `${baseUrl}/api/auth/callback`;
    
    // Obter tokens
    const tokens = await getTokensFromCode(code, redirectUri);
    
    // Criar cliente OAuth2 para obter informações do usuário
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    // Salvar usuário no banco
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

    // Criar sessão usando cookie httpOnly
    // Em produção, use JWT ou sessão segura
    const sessionData = {
      userId: user.id,
      googleId: userInfo.id,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    // Definir cookie de sessão (codificar JSON para URL-safe)
    const sessionCookie = encodeURIComponent(JSON.stringify(sessionData));
    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader('Set-Cookie', `session=${sessionCookie}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`);

    // Redirecionar para o frontend
    res.redirect(`${frontendUrl}?auth=success`);
  } catch (error: any) {
    console.error('Erro no callback:', error);
    res.redirect(`${frontendUrl}?auth=error&reason=callback_failed`);
  }
}

