// Controlador para as lojas físicas
import { Request, Response } from 'express';
import Store from '../models/storeModel';
import logger from '../utils/logger';
import { obterCoordenadasPorCep } from '../utils/obterCoordenadas';
import { calcularDistancia } from '../utils/conv-distance';
import { buscarEnderecoPorCep } from '../utils/viacep';

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
      // Caso o CEP não seja encontrado, tentamos usar o nome da rua, cidade e estado para buscar as coordenadas
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
    // Obter coordenadas do CEP do usuário
    const userCoordinates = await obterCoordenadasPorCep(postalCode);

    if (!userCoordinates) {
      return res.status(400).json({ message: 'CEP inválido ou não encontrado.' });
    }

    const { latitude: userLat, longitude: userLon } = userCoordinates;
    logger.info(`Coordenadas do usuário - Latitude: ${userLat}, Longitude: ${userLon}`);

    // Buscar todas as lojas cadastradas
    const stores = await Store.find();

    const nearbyStores = stores.map((store) => {
      const { latitude: storeLat, longitude: storeLon } = store.address as {
        latitude: number;
        longitude: number;
      };

      // Log para verificar as coordenadas das lojas
      logger.info(`Loja: ${store.name}, Latitude: ${storeLat}, Longitude: ${storeLon}`);

      // Calculo da distancia usando lei dos cossenos
      const distance = calcularDistancia(userLat, userLon, storeLat, storeLon);

      return { store, distance };
    });

    // Filtrar lojas dentro de 100 km
    const filteredStores = nearbyStores.filter(({ distance }) => distance <= 100);

    // Ordenar lojas por distância (mais próximas primeiro)
    filteredStores.sort((a, b) => a.distance - b.distance);

    if (filteredStores.length > 0) {
      return res.status(200).json(filteredStores);
    } else {
      return res.status(404).json({ message: 'Nenhuma loja encontrada em um raio de 100 km.' });
    }
  } catch (error: any) {
    logger.error(`Erro ao buscar lojas próximas: ${error.message}`);
    return res.status(500).json({ message: 'Erro ao buscar lojas próximas.' });
  }
};