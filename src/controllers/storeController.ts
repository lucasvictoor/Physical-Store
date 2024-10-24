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
    logger.info(`Loja criada com sucesso: ${newStore._id}`); // Adicionado log de sucesso
    return res.status(201).json(newStore);  // Retorna a loja criada
  } catch (error: any) {
    logger.error(`Erro ao criar loja: ${error.message}`);
    return res.status(500).json({ message: 'Erro ao criar loja.', error: error.message });  // Retorna erro
  }
};

// Função para mostrar todas as lojas cadastradas
export const getStores = async (req: Request, res: Response) => {
    try {
      const stores = await Store.find();
      logger.info(`Listagem de todas as lojas. Total: ${stores.length}`); // Adicionado log
      return res.status(200).json(stores);
    } catch (error: any) {
      logger.error(`Erro ao obter lojas: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao obter lojas', error: error.message });
    }
  };  

// Função para deletar
export const deleteStore = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const store = await Store.findByIdAndDelete(id);
      if (!store) {
        logger.warn(`Tentativa de deletar loja não existente: ${id}`); // Aviso de log
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      logger.info(`Loja deletada com sucesso: ${id}`);
      return res.status(200).json({ message: 'Loja deletada com sucesso' });
    } catch (error: any) {
      logger.error(`Erro ao deletar loja: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao deletar loja', error: error.message });
    }
  };  

// Função para obter uma loja específica
export const getStoreById = async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const store = await Store.findById(id);
      if (!store) {
        logger.warn(`Loja não encontrada: ${id}`); // Aviso de loja não encontrada
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      logger.info(`Loja encontrada: ${id}`);
      return res.status(200).json(store);
    } catch (error: any) {
      logger.error(`Erro ao obter loja: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao obter loja', error: error.message });
    }
  };  