import { API_BASE_URL } from "./api";
import { storageService } from './storageService';

export interface RestauranteImagem {
  id: number;
  url: string;
  descricao: string;
  created_at: string;
  updated_at: string;
}

export interface Restaurante {
  id: number;
  destino_id: number | null;
  nome: string;
  tipo_cozinha: string;
  endereco_id: number;
  telefone: string;
  email: string;
  preco_medio_refeicao: string;
  classificacao: number;
  horario_funcionamento: string;
  created_at: string;
  updated_at: string;
  avaliacao_media: number;
  imagem: string;
  imagens: RestauranteImagem[];
  avaliacoes: any[];
}

export interface CompararRestaurantesResponse {
  mais_barato: Restaurante;
  melhor_avaliado: Restaurante;
  lista: Restaurante[];
}

export async function compararRestaurantes(
  cidade: string,
  tipo_cozinha: string
): Promise<CompararRestaurantesResponse | null> {
  const token = await storageService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const params = new URLSearchParams({
    cidade,
    tipo_cozinha,
  });
 // console.log('📦 Parâmetros enviados:', cidade, tipo);

  const url = `${API_BASE_URL}turista/restaurantes/comparar?${params.toString()}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
console.log('📦 URL Final da Requisição:', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return null;
    }

   const json = await response.json();

    if (!json || !json.data) {
    console.log('[RestauranteService] Resposta da API vazia:', json);
    return null;
    }

    console.log('[RestauranteService] Dados recebidos:', json.data);

    return json.data as CompararRestaurantesResponse;
  } catch (error) {
    console.log('[RestauranteService] Erro na requisição:', error);
    return null;
  }

 
}
