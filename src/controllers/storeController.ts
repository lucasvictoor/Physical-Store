import logger from '../utils/logger';
import Store from '../models/storeModel';
import { Request, Response } from 'express';
import { buscarEnderecoPorCep } from '../utils/viacep';
import { calcularDistancia } from '../utils/conv-distance';
import { obterCoordenadasPorCep } from '../utils/obterCoordenadas';

// Função auxiliar para calculo de lojas próximas
const calcularLojasProximas = async (
  userCoordinates: { latitude: number; longitude: number },
  maxDistance: number = 100
) => {
  const stores = await Store.find();
  return stores
    .map((store) => {
      const { latitude: storeLat, longitude: storeLon } = store.address as {
        latitude: number;
        longitude: number;
      };
      const distance = calcularDistancia(
        userCoordinates.latitude,
        userCoordinates.longitude,
        storeLat,
        storeLon
      );
      return { store, distance: `${distance.toFixed(2)} km`,};
    })
    .filter(({ distance }) => parseFloat(distance) <= maxDistance)
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// Função de validação se loja com o mesmo CEP já existe
const verificarLojaExistente = async (postalCode: string) => {
  const existingStore = await Store.findOne({ "address.postalCode": postalCode });
  if (existingStore) {
    throw new Error(`Já existe uma loja cadastrada com o CEP ${postalCode}.`);
  }
};

// Função auxiliar para obter endereço e coordenadas
const obterEnderecoCompleto = async (postalCode: string, address: any) => {
  try {
    const enderecoViacep = await buscarEnderecoPorCep(postalCode);
    const coordenadas = await obterCoordenadasPorCep(postalCode);
    return {
      ...enderecoViacep,
      number: address.number,
      latitude: coordenadas.latitude,
      longitude: coordenadas.longitude,
    };
  } catch {
    if (address.street && address.city && address.state) {
      const fullAddress = `${address.street}, ${address.city}, ${address.state}`;
      const coordenadas = await obterCoordenadasPorCep(fullAddress);
      return {
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode,
        number: address.number,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,
      };
    }
    throw new Error('CEP ou endereço inválido.');
  }
};

// Função para criação da loja
export const createStore = async (req: Request, res: Response): Promise<Response> => {
  const { name, address } = req.body;
  const { postalCode } = address;

  try {
    await verificarLojaExistente(postalCode);
    const fullAddress = await obterEnderecoCompleto(postalCode, address);

    const newStore = new Store({ name, address: fullAddress });
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
      logger.info(`Listagem de todas as lojas. Total: ${stores.length}`);
      return res.status(200).json(stores);
    } catch (error: any) {
      logger.error(`Erro ao obter lojas: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao obter lojas', error: error.message });
    }
};  

// Função para deletar uma loja pelo ID
export const deleteStore = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
  
    try {
      const store = await Store.findByIdAndDelete(id);
      if (!store) {
        logger.warn(`Tentativa de deletar loja não existente: ${id}`);
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      logger.info(`Loja deletada com sucesso: ${id}`);
      return res.status(200).json({ message: 'Loja deletada com sucesso' });
    } catch (error: any) {
      logger.error(`Erro ao deletar loja: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao deletar loja', error: error.message });
    }
};  

// Função para obter uma loja específica pelo ID
export const getStoreById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
  
    try {
      const store = await Store.findById(id);
      if (!store) {
        logger.warn(`Loja não encontrada: ${id}`);
        return res.status(404).json({ message: 'Loja não encontrada' });
      }
      logger.info(`Loja encontrada: ${id}`);
      return res.status(200).json(store);
    } catch (error: any) {
      logger.error(`Erro ao obter loja: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao obter loja', error: error.message });
    }
};

// Função para buscar lojas próximas a um CEP dentro do raio de 100KM
export const buscarLojasProximas = async (req: Request, res: Response): Promise<Response> => {
  const { postalCode } = req.body;

  try {
    const userCoordinates = await obterCoordenadasPorCep(postalCode);
    if (!userCoordinates) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado.' });
    }

    const nearbyStores = await calcularLojasProximas(userCoordinates);
    if (nearbyStores.length > 0) {
      return res.status(200).json({
        message: `${nearbyStores.length} loja(s) encontrada(s) a menos de 100km do CEP fornecido`,
        stores: nearbyStores,
      });
    } else {
      return res.status(404).json({ message: 'Nenhuma loja encontrada em um raio de 100 km.' });
    }
  } catch (error: any) {
    logger.error(`Erro ao buscar lojas próximas: ${error.message}`);
    return res.status(500).json({ message: 'Erro ao buscar lojas próximas.', error: error.message });
  }
};