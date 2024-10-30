import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/conn';
import logger from './utils/logger';
import storeRoutes from './routes/storeRoutes';

// Carrega as váriaveis do ambiente do .env
dotenv.config();

const app = express();
app.use(express.json());

// Conexão Banco de Dados
connectDB();

const PORT = process.env.PORT || 4000;

// Inicialização do servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

// Rotas para as lojas
app.use('/api/stores', storeRoutes);

// Verificação de Erro
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(`Erro: ${err.message}`);
  res.status(500).send('Algo deu errado!');
});