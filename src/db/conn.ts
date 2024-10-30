import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carrega as váriaveis do ambiente do .env
dotenv.config();

// Função para conectar com o Banco de Dados
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('MongoDB conectado!');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;