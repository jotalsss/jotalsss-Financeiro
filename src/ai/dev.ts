import { config } from 'dotenv';
// A chamada config() do dotenv carrega variáveis de ambiente de um arquivo .env.
// Isso é útil para desenvolvimento local. Em ambientes de produção como o Vercel,
// as variáveis de ambiente são configuradas diretamente na plataforma.
config();

// Removida importação para '@/ai/flows/generate-financial-tips.ts'; pois a funcionalidade foi removida.
