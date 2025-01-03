import axios from 'axios';

// Função utilizando a API do Google Geocoding para obtenção de coordenadas
export const obterCoordenadasPorCep = async (cep: string) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: cep,
        key: apiKey,
        region: 'br'
      },
    });

    if (response.data.status !== 'OK' || response.data.results.length === 0) {
      throw new Error('CEP inválido ou não encontrado.');
    }

    // Extração das coordenadas da resposta da API
    const location = response.data.results[0].geometry.location;
    console.log(`Coordenadas para CEP ${cep}: Latitude ${location.lat}, Longitude ${location.lng}`);
    return {
      latitude: location.lat,
      longitude: location.lng,
    };
  } catch (error: any) {
    throw new Error(`Erro ao obter coordenadas para o CEP ${cep}: ${error.message}`);
  }
};