import { API_BASE_URL } from './api';
import { storageService } from './storageService';

export interface NearbyPlacesResponse {
  paisagens: any[];
  acomodacoes: any[];
  restaurantes: any[];
  eventos: any[];
}

export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  raio?: number
): Promise<NearbyPlacesResponse | null> {
  const token = await storageService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
  });
  if (raio) {
    params.append('raio', raio.toString());
  }

  const url = `${API_BASE_URL}turista/localizacao?${params.toString()}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  console.log('[LocationService] Fazendo requisição GET:', url);
  console.log('[LocationService] Headers:', headers);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    console.log('[LocationService] Resposta da API:', data);

    if (!response.ok) {
      // Você pode customizar o tratamento de erro conforme necessário
      return null;
    }

    return data as NearbyPlacesResponse;
  } catch (error) {
    console.log('[LocationService] Erro na requisição:', error);
    return null;
  }
}
