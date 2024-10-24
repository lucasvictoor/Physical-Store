// Controlador para as lojas físicas
import { Request, Response } from 'express';
import Store from '../models/storeModel';
import logger from '../utils/logger';

// Função para criar uma loja
export const createStore = async (req: Request, res: Response) => {
  const { name, address } = req.body;
  const { street, city, state, postalCode, number } = address;

  try {
    // Criar uma nova loja diretamente com as informações fornecidas
    const newStore = new Store({
      name: name,
      address: {
        street,
        city,
        state,
        postalCode,
        number
      }
    });

    // Salva a loja no banco de dados
    await newStore.save();
    return res.status(201).json(newStore);  // Retorna a loja criada
  } catch (error: any) {
    logger.error(`Erro ao criar loja: ${error.message}`);
    return res.status(500).json({ message: 'Erro ao criar loja.', error: error.message });  // Retorna erro
  }
};