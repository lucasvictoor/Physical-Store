import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/conn';

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});