// Função para converter cep em coordenadas usando a API OpenCage
import axios from 'axios';

export const obterCoordenadasPorCep = async (cep: string) => {
  try {
    const apiKey = '0e109e0f72514d0ba6116af6b4e95d85'; // Sua chave da API OpenCage
    const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
      params: {
        q: cep,
        key: apiKey,
      },
    });

    if (response.data.results.length === 0) {
      throw new Error('CEP inválido ou não encontrado.');
    }

    const location = response.data.results[0].geometry;
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error: any) {
    throw new Error(`Erro ao obter coordenadas para o CEP ${cep}: ${error.message}`);
  }
};