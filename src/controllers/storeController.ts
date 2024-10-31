// Controlador para as lojas físicas
import { Request, Response } from 'express';
import Store from '../models/storeModel';
import logger from '../utils/logger';
import { obterCoordenadasPorCep } from '../utils/obterCoordenadas';
import { calcularDistancia } from '../utils/conv-distance';
import { buscarEnderecoPorCep } from '../utils/viacep';

// Função para criar uma loja
export const createStore = async (req: Request, res: Response): Promise<Response> => {
  const { name, address } = req.body;
  const { postalCode, number, street, city, state } = address;

  try {
    // Verificação se já existe uma loja com o mesmo CEP
    const existingStore = await Store.findOne({ "address.postalCode": postalCode });
    if(existingStore){
      logger.warn(`Tentativa de criação de loja bloqueada: CEP ${postalCode} já está cadastrado para outra loja.`);
      return res.status(400).json({ message: 'Já existe uma loja cadastrada com esse CEP.'});
    }

    // Primeiro, tentamos obter o endereço completo e as coordenadas pelo CEP
    let enderecoViacep;
    let coordenadas;

    try {
      enderecoViacep = await buscarEnderecoPorCep(postalCode);
      coordenadas = await obterCoordenadasPorCep(postalCode);

      // Verificação se endereço está completo ou não
      if (!enderecoViacep.street || !enderecoViacep.city || !enderecoViacep.state) {
        throw new Error('Endereço incompleto.');
      }

    } catch (error) {
      // Caso o CEP não seja encontrado, utiliza nome da rua, cidade e estado
      if (street && city && state) {
        logger.info('CEP não encontrado, tentando buscar com endereço completo.');
        const fullAddress = `${street}, ${city}, ${state}`;
        coordenadas = await obterCoordenadasPorCep(fullAddress);
        
        enderecoViacep = { street, city, state, postalCode: postalCode || 'Não especificado' };
      } else {
        return res.status(400).json({
          message: 'CEP não encontrado. Por favor, forneça o nome da rua, cidade e estado.'
        });
      }
    }

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
      logger.info(`Listagem de todas as lojas. Total: ${stores.length}`);
      return res.status(200).json(stores);
    } catch (error: any) {
      logger.error(`Erro ao obter lojas: ${error.message}`);
      return res.status(500).json({ message: 'Erro ao obter lojas', error: error.message });
    }
};  

// Função para deletar uma loja pelo ID
export const deleteStore = async (req: Request, res: Response) => {
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
export const getStoreById = async (req: Request, res: Response) => {
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
export const buscarLojasProximas = async (req: Request, res: Response) => {
  const { postalCode } = req.body;

  try {
    const userCoordinates = await obterCoordenadasPorCep(postalCode);
    if (!userCoordinates) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado.' });
    }

    const { latitude: userLat, longitude: userLon } = userCoordinates;
    logger.info(`Coordenadas do usuário - Latitude: ${userLat}, Longitude: ${userLon}`);

    const stores = await Store.find();
    const nearbyStores = stores
      .map((store) => { // Map é responsável por iterar sobre todas as lojas
        const { latitude: storeLat, longitude: storeLon } = store.address as {
          latitude: number;
          longitude: number;
        };

        const distance = calcularDistancia(userLat, userLon, storeLat, storeLon);
        logger.info(`Loja: ${store.name}, Distância: ${distance.toFixed(2)} Km`);

        return { store, distance: `${distance.toFixed(2)} Km` };
      })
      .filter(({ distance }) => parseFloat(distance) <= 100) // Filtrar lojas dentro de 100 km
      .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); // Ordenar por proximidade

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
    return res.status(500).json({ message: 'Erro ao buscar lojas próximas.' });
  }
};