// API Route do Next.js para Login
import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('[LOGIN] ========================================');
    console.log('[LOGIN] Tentativa de login recebida');
    console.log('[LOGIN] Email:', email);
    console.log('[LOGIN] Senha fornecida:', password ? 'SIM (' + password.length + ' caracteres)' : 'NÃO');
    console.log('[LOGIN] ========================================');

    if (!email || !password) {
      console.log('[LOGIN] ❌ Erro: Email ou senha faltando');
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await User.verifyCredentials(email, password);
    
    if (!user) {
      console.log('[LOGIN] ❌ Erro: Credenciais inválidas para:', email);
      return NextResponse.json(
        { error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    console.log('[LOGIN] ✅ Sucesso para:', email);
    console.log('[LOGIN] Usuário retornado:', { id: user.id, name: user.name, role: user.role });
    
    return NextResponse.json({
      user,
      message: 'Login realizado com sucesso',
    });
  } catch (error: any) {
    console.error('[LOGIN] ❌ Erro:', error.message);
    console.error('[LOGIN] Stack:', error.stack);
    
    if (error.message === 'Usuário inativo') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

