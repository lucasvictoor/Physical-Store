// Controlador para as lojas físicas
import { Request, Response } from 'express';
import Store from '../models/storeModel';
import logger from '../utils/logger';
import { obterCoordenadasPorCep } from '../utils/obterCoordenadas';
import { calcularDistancia } from '../utils/conv-distance';
import { buscarEnderecoPorCep } from '../utils/viacep';

export const createStore = async (req: Request, res: Response): Promise<Response> => {
  const { name, address } = req.body;
  const { postalCode, number } = address;

  try {
    const enderecoViacep = await buscarEnderecoPorCep(postalCode);
    const coordenadas = await obterCoordenadasPorCep(postalCode);

    const fullAddress = {
      ...enderecoViacep,
      number: number,
      latitude: coordenadas.latitude,
      longitude: coordenadas.longitude,
    };

    const newStore = new Store({
      name: name,
      address: fullAddress,
    });

    await newStore.save();
    logger.info(`Loja criada com sucesso: ${newStore._id}`);
    return res.status(201).json(newStore);
  } catch (error: any) {
    logger.error(`Erro ao criar loja: ${error.message}`);
    return res.status(400).json({ message: 'Erro ao criar loja', error: error.message });
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

// Função para buscar lojas próximas
export const buscarLojasProximas = async (req: Request, res: Response) => {
  const { postalCode } = req.body;

  try {
    // Verificar se o CEP é válido
    const enderecoViacep = await buscarEnderecoPorCep(postalCode);

    if (!enderecoViacep) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado.' });
    }

    const userCoordinates = await obterCoordenadasPorCep(postalCode);
    const { latitude: userLat, longitude: userLon } = userCoordinates;

    const stores = await Store.find();
    const nearbyStores = [];

    for (const store of stores) {
      const { latitude: storeLat, longitude: storeLon } = store.address as {
        latitude: number;
        longitude: number;
      };

      const distance = calcularDistancia(userLat, userLon, storeLat, storeLon);

      // Se a loja estiver dentro do raio de 100 km, adiciona à lista
      if (distance <= 100) {
        nearbyStores.push({ store, distance });
      }
    }

    // Ordena as lojas pela distância (mais próxima primeiro)
    nearbyStores.sort((a, b) => a.distance - b.distance);

    if (nearbyStores.length > 0) {
      return res.status(200).json(nearbyStores);
    } else {
      return res.status(404).json({ message: 'Nenhuma loja encontrada em um raio de 100 km.' });
    }
  } catch (error: any) {
    logger.error(`Erro ao buscar lojas próximas: ${error.message}`);
    return res.status(500).json({ message: 'Erro ao buscar lojas próximas.' });
  }
};