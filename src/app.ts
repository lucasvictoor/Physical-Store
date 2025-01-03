import dotenv from 'dotenv';
import connectDB from './db/conn';
import logger from './utils/logger';
import storeRoutes from './routes/storeRoutes';
import express, { Request, Response, NextFunction } from 'express';

// Carrega as variáveis do ambiente do .env
dotenv.config();

const app = express();

// Config de middlewares
const configureMiddlewares = (app: express.Application) => {
  app.use(express.json());
  app.use('/api/stores', storeRoutes);
  
  // Middleware para erros
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Erro: ${err.message}`);
    res.status(500).json({ error: 'Algo deu errado!' });
  });
};

connectDB();
configureMiddlewares(app);

const PORT = process.env.PORT || 4000;

// Inicialização do servidor
app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

export default app;