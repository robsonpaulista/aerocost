-- Função para verificar senha usando crypt() do PostgreSQL
-- Execute este script no Supabase SQL Editor

CREATE OR REPLACE FUNCTION verify_password(p_email VARCHAR, p_password VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_hash VARCHAR;
BEGIN
  -- Busca o hash do usuário
  SELECT password_hash INTO v_hash
  FROM users
  WHERE email = p_email AND is_active = true;
  
  -- Se não encontrou usuário, retorna false
  IF v_hash IS NULL THEN
    RETURN false;
  END IF;
  
  -- Compara a senha usando crypt()
  -- crypt() do PostgreSQL pode verificar senhas geradas com crypt() ou bcrypt
  RETURN (crypt(p_password, v_hash) = v_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

