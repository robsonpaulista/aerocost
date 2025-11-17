# AeroCost Frontend

Interface web moderna e clean para o sistema AeroCost.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Lucide Icons** - Ícones modernos
- **Recharts** - Gráficos
- **Axios** - Cliente HTTP

## 📦 Instalação

```bash
cd frontend
npm install
```

## 🔧 Configuração

1. Copie o arquivo de exemplo:
```bash
cp .env.local.example .env.local
```

2. Configure a URL da API no `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## ▶️ Executar

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3001`

## 📁 Estrutura

```
frontend/
├── app/              # Páginas Next.js (App Router)
├── components/       # Componentes React
│   ├── ui/          # Componentes de UI (Button, Input, Card, etc)
│   └── ...          # Componentes específicos
├── lib/             # Utilitários e serviços
│   └── api.ts       # Cliente API
└── public/          # Arquivos estáticos
```

## 🎨 Design System

- **Primary**: #2E70F0 (Azul)
- **Secondary**: #F3F4F6 (Cinza claro)
- **Accent**: #22C55E (Verde)
- **Text**: #1F2937 (Cinza escuro)

