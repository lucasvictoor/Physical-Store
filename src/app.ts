import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/conn';
import logger from './utils/logger';

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

// Verificação de Erro
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(`Erro: ${err.message}`);
  res.status(500).send('Algo deu errado!');
});