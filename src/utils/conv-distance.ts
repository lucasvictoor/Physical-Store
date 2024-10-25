export const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em km
  
    // Converte as coordenadas de graus para radianos
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lon1Rad = (lon1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const lon2Rad = (lon2 * Math.PI) / 180;
  
    // Aplica a Lei dos Cossenos Esféricos
    const distancia = Math.acos(
      Math.sin(lat1Rad) * Math.sin(lat2Rad) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lon1Rad - lon2Rad)
    ) * R;
  
    return distancia; // Distância em km
  };
  