export const calcularDistancia = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Raio da Terra em KM
  
    // Converte as coordenadas de graus para radianos
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);
  
    // Aplica a Lei dos Cossenos Esféricos
    const distancia = Math.acos(
      Math.sin(lat1Rad) * Math.sin(lat2Rad) +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.cos(lon1Rad - lon2Rad)
    ) * R;
  
    return distancia;
  };