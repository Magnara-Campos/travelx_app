import { API_BASE_URL } from './api';
import { storageService } from './storageService';

export interface Endereco {
  latitude: number;
  longitude: number;
}

export interface Restaurante {
  id: number;
  destino_id: number | null;
  nome: string;
  tipo_cozinha: string;
  endereco: Endereco;
  telefone: string;
  email: string;
  preco_medio_refeicao: string;
  classificacao: number;
  horario_funcionamento: string;
  created_at: string;
  updated_at: string;
  avaliacao_media: number;
  imagem: string;
  imagens: any[];
  avaliacoes: any[];
}

export interface Paisagem {
  id: number;
  nome: string;
  endereco: Endereco;
  descricao: any[];
  imagens: any[];
  created_at: string;
  updated_at: string;
}

export interface Acomodacao {
  id: number;
  nome: string;
  endereco: Endereco;
  preco_medio: string;
  classificacao: number;
  imagens: any[];
  created_at: string;
  updated_at: string;
}

export interface Evento {
  id: number;
  nome: string;
  endereco: Endereco;
  data_inicio: string;
  data_fim: string;
  created_at: string;
  updated_at: string;
}

export interface NearbyPlacesResponse {
  paisagens: Paisagem[];
  acomodacoes: Acomodacao[];
  restaurantes: Restaurante[];
  eventos: Evento[];
}

export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  raio: number = 10
): Promise<NearbyPlacesResponse | null> {
  const token = await storageService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  if (typeof latitude !== 'number' || isNaN(latitude) || !isFinite(latitude)) {
    console.log('[LocationService] Erro: Latitude deve ser um número válido:', latitude);
    throw new Error('Latitude inválida. Deve ser um número entre -90 e 90.');
  }
  if (typeof longitude !== 'number' || isNaN(longitude) || !isFinite(longitude)) {
    console.log('[LocationService] Erro: Longitude deve ser um número válido:', longitude);
    throw new Error('Longitude inválida. Deve estar entre -180 e 180.');
  }
  if (typeof raio !== 'number' || isNaN(raio) || !isFinite(raio)) {
    console.log('[LocationService] Erro: Raio deve ser um número válido:', raio);
    throw new Error('Raio inválido. Deve ser um número maior ou igual a 1.');
  }

  if (latitude < -90 || latitude > 90) {
    console.log('[LocationService] Erro: Latitude deve estar entre -90 e 90:', latitude);
    throw new Error('Latitude fora do intervalo. Deve estar entre -90 e 90.');
  }
  if (longitude < -180 || longitude > 180) {
    console.log('[LocationService] Erro: Longitude deve estar entre -180 e 180:', longitude);
    throw new Error('Longitude fora do intervalo. Deve estar entre -180 e 180.');
  }
  if (raio < 1) {
    console.log('[LocationService] Erro: Raio deve ser pelo menos 1:', raio);
    throw new Error('Raio inválido. Deve ser pelo menos 1.');
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    raio: raio.toString(),
  });

  const url = `${API_BASE_URL}turista/lugares-proximos?${params.toString()}`;
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
      console.log('[LocationService] Resposta não OK:', response.status, data);
      throw new Error(`Erro na requisição: ${data.message || 'Resposta inválida da API'}`);
    }

    if (!data || !data.paisagens) {
      console.log('[LocationService] Resposta da API vazia ou incompleta:', data);
      return null;
    }

    return data as NearbyPlacesResponse;
  } catch (error) {
    console.log('[LocationService] Erro na requisição:', error);
    throw error;
  }
}