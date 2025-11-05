# 📸 PhotoFinder - Organizador Inteligente de Fotos com IA

## 🎯 Visão Geral

O **PhotoFinder** é uma aplicação moderna que organiza, analisa e permite buscar fotos armazenadas no Google Drive com base em atributos automáticos extraídos por inteligência artificial, como expressões faciais, localizações, datas e pessoas.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação OAuth 2.0** com Google
- 📂 **Sincronização automática** com Google Drive
- 🤖 **Análise com IA** usando Google Cloud Vision API (opcional)
- 😄 **Detecção de emoções** (alegria, tristeza, raiva, surpresa)
- 👥 **Contagem de rostos** nas fotos
- 📍 **Extração de localização GPS** dos metadados EXIF
- 🔍 **Busca avançada** por pessoa, emoção, local, data e quantidade de rostos
- 📱 **Interface responsiva** e moderna
- 🖼️ **Galeria de fotos** com paginação
- ✏️ **Edição de metadados** (tags de pessoa e local)

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Google Drive   │────▶│  Backend Node.js  │────▶│    Supabase     │
│      API        │     │   + Express.js    │     │   (PostgreSQL)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                           │
                               ▼                           ▼
                        ┌──────────────────┐
                        │  Frontend Next.js │
                        │  + TypeScript     │
                        └──────────────────┘
```

### Tecnologias Utilizadas

**Backend:**
- Node.js + Express
- Google Drive API
- Google Cloud Vision API (opcional)
- Supabase (PostgreSQL)
- OAuth 2.0

**Frontend:**
- Next.js 14
- TypeScript
- React Hooks
- CSS-in-JS

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Google Cloud Platform
- Conta Supabase (gratuita)
- Git

## 🚀 Configuração do Projeto

### Etapa 1: Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd photofinder
```

### Etapa 2: Configurar Google Cloud Platform

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto chamado "photofinder"
3. Ative as seguintes APIs:
   - Google Drive API
   - Google Cloud Vision API (opcional)
   - Google People API

4. Criar credenciais OAuth 2.0:
   - Vá em **APIs e Serviços → Credenciais**
   - Clique em **Criar credenciais → ID do cliente OAuth**
   - Tipo: Aplicativo Web
   - URIs de redirecionamento autorizados:
     - `http://localhost:4000/api/auth/callback` (desenvolvimento)
     - `https://seu-dominio.vercel.app/api/auth/callback` (produção)
   - Salve o **Client ID** e **Client Secret**

### Etapa 3: Configurar Supabase

1. Acesse [Supabase](https://supabase.com/) e crie um novo projeto
2. Vá em **SQL Editor** e execute o script `database/schema.sql`
3. Copie as credenciais:
   - Project URL
   - Anon Key
   - Service Role Key (para o backend)

### Etapa 4: Configurar Variáveis de Ambiente

#### Backend (.env na raiz do projeto)

```bash
# Google Cloud Configuration
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/callback

# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_KEY=sua_service_key_aqui

# Backend Configuration
BACKEND_PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Session Secret (gere uma string aleatória)
SESSION_SECRET=sua_chave_secreta_aleatoria_aqui

# Google Cloud Vision (opcional)
GOOGLE_CLOUD_VISION_ENABLED=false
```

#### Frontend (frontend/.env.local)

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=PhotoFinder
```

### Etapa 5: Instalar Dependências

```bash
# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### Etapa 6: Executar o Projeto

#### Opção 1: Executar separadamente

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

#### Opção 2: Executar tudo junto (da raiz do projeto)

```bash
npm install  # Instala concurrently
npm run dev  # Executa backend e frontend simultaneamente
```

A aplicação estará disponível em:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:4000

## 📖 Como Usar

### 1. Fazer Login

1. Acesse http://localhost:3000
2. Clique em "Entrar com Google"
3. Autorize o acesso ao seu Google Drive

### 2. Sincronizar Fotos

1. Após o login, clique no botão "🔄 Sincronizar Fotos"
2. O sistema irá:
   - Buscar todas as imagens do seu Google Drive
   - Extrair metadados (data, GPS, dimensões)
   - Salvar as informações no banco de dados
3. Aguarde a sincronização ser concluída

### 3. Buscar e Filtrar Fotos

Use os filtros disponíveis para encontrar fotos específicas:

- **👤 Pessoa:** Nome da pessoa marcada
- **😄 Expressão:** Nível de alegria detectado
- **📍 Local:** Cidade ou nome do local
- **📅 Ano:** Ano da foto
- **👥 Rostos:** Quantidade mínima/máxima de rostos

### 4. Ver Detalhes da Foto

1. Clique em qualquer foto da galeria
2. Veja informações detalhadas:
   - Data e hora
   - Localização GPS
   - Análise de emoções (se habilitada)
   - Quantidade de rostos
   - Metadados do arquivo

### 5. Editar Informações

1. Na página de detalhes, clique em "✏️ Editar Informações"
2. Adicione ou altere:
   - Nome da pessoa
   - Nome do local
3. Clique em "💾 Salvar"

## 🤖 Análise com IA (Opcional)

Para habilitar a análise automática com Google Cloud Vision API:

1. Configure `GOOGLE_CLOUD_VISION_ENABLED=true` no `.env`
2. Certifique-se de que a Vision API está ativada no Google Cloud
3. Na próxima sincronização, marque a opção "Analisar com Vision API"

**Nota:** A Vision API tem custo após 1000 imagens/mês (~$1,50 por 1000 imagens)

## 🔒 Segurança

- ✅ Tokens OAuth armazenados de forma segura no banco
- ✅ Imagens nunca são expostas publicamente
- ✅ Streaming seguro através do backend
- ✅ Sessões com cookies HTTP-only
- ✅ CORS configurado corretamente
- ✅ Validação de permissões em todas as rotas

## 📊 Estrutura do Banco de Dados

### Tabela: `photos`

Armazena metadados e análises das fotos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único |
| drive_id | TEXT | ID no Google Drive |
| name | TEXT | Nome do arquivo |
| created_at | TIMESTAMP | Data da foto |
| gps_lat/gps_lng | FLOAT | Coordenadas GPS |
| person_tag | TEXT | Nome da pessoa |
| joy_likelihood | TEXT | Nível de alegria |
| faces_detected | INTEGER | Quantidade de rostos |
| analyzed | BOOLEAN | Se foi analisada com IA |

### Tabela: `users`

Gerencia usuários e tokens OAuth

### Tabela: `sync_events`

Histórico de sincronizações

### Tabela: `photo_tags`

Tags personalizadas das fotos

## 🚀 Deploy (Vercel + Supabase)

### Deploy do Frontend

```bash
cd frontend
vercel
```

Configure as variáveis de ambiente no Vercel:
- `NEXT_PUBLIC_BACKEND_URL`

### Deploy do Backend

Opções:
1. **Vercel Serverless Functions** (recomendado para baixo volume)
2. **Railway/Render** (para APIs persistentes)
3. **AWS/GCP** (para produção em larga escala)

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Produção
```

### Frontend
```bash
npm run dev      # Desenvolvimento
npm run build    # Build de produção
npm start        # Servir build de produção
npm run lint     # Lint do código
```

## 🐛 Troubleshooting

### Erro de autenticação

- Verifique se os URIs de redirecionamento estão corretos no Google Cloud Console
- Confirme que `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` estão corretos

### Fotos não aparecem

- Verifique a conexão com o Supabase
- Execute a sincronização manualmente
- Confira os logs do backend

### Erro ao fazer streaming de imagens

- Certifique-se de que os tokens OAuth estão válidos
- Verifique se o usuário tem acesso ao arquivo no Drive

## 📈 Melhorias Futuras

- [ ] Reconhecimento facial com CLIP/FaceNet
- [ ] Álbuns automáticos por emoção/local/evento
- [ ] Timeline interativa de fotos
- [ ] API pública com autenticação JWT
- [ ] Exportação de fotos selecionadas como ZIP
- [ ] Suporte a vídeos
- [ ] Busca por texto em fotos (OCR)
- [ ] Compartilhamento de álbuns

## 📝 Licença

Este projeto é de código aberto para fins educacionais.

## 👨‍💻 Autor

Desenvolvido como projeto de demonstração de integração com APIs do Google e IA.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte a seção de Troubleshooting
2. Verifique os logs do backend e frontend
3. Abra uma issue no repositório

---

**🎉 Aproveite o PhotoFinder e organize suas fotos de forma inteligente!**
