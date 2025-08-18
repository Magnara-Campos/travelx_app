import { API_BASE_URL } from "./api";
import { storageService } from './storageService';

export interface DestinoImagem {
  id: number;
  url: string;
  nome_arquivo: string | null;
  tamanho: number | null;
  tipo: string | null;
  descricao: string;
  criado_em: string;
}

export interface Destino {
  id: number;
  nome: string;
  pais: string;
  regiao: string;
  descricao: string;
  latitude: number | null;
  longitude: number | null;
  clima: string;
  moeda: string;
  idioma: string;
  imagem_principal: string;
  avaliacao_media: number | null;
  total_avaliacoes: number;
  imagens: DestinoImagem[];
  avaliacoes: any[];
  criado_em: string;
  atualizado_em: string;
}

export interface DestinosResponse {
  data: Destino[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export async function fetchDestinos(
  page: number = 1,
  perPage: number = 10
): Promise<DestinosResponse | null> {
  const token = await storageService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  const url = `${API_BASE_URL}turista/destinos?${params.toString()}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  console.log('[DestinoService] URL Final da Requisição:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.log('[DestinoService] Resposta não OK:', response.status);
      return null;
    }

    const json = await response.json();

    if (!json || !json.data) {
      console.log('[DestinoService] Resposta da API vazia:', json);
      return null;
    }

    console.log('[DestinoService] Dados recebidos:', json);

    return json as DestinosResponse;
  } catch (error) {
    console.log('[DestinoService] Erro na requisição:', error);
    return null;
  }
}

export async function fetchDestinoById(id: number): Promise<Destino | null> {
  const token = await storageService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const url = `${API_BASE_URL}turista/destinos/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  console.log('[DestinoService] URL Final da Requisição:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.log('[DestinoService] Resposta não OK:', response.status);
      return null;
    }

    const json = await response.json();

    if (!json || !json.data) {
      console.log('[DestinoService] Resposta da API vazia:', json);
      return null;
    }

    console.log('[DestinoService] Dados recebidos:', json.data);

    return json.data as Destino;
  } catch (error) {
    console.log('[DestinoService] Erro na requisição:', error);
    return null;
  }
}

export async function fetchDestinoImagens(id: number): Promise<DestinoImagem[] | null> {
  const token = await storageService.getAuthToken();
  if (!token) {
    throw new Error('Usuário não autenticado');
  }

  const url = `${API_BASE_URL}turista/destinos/${id}/imagens`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  console.log('[DestinoService] URL Final da Requisição:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.log('[DestinoService] Resposta não OK:', response.status);
      return null;
    }

    const json = await response.json();

    if (!json || !json.data) {
      console.log('[DestinoService] Resposta da API vazia:', json);
      return null;
    }

    console.log('[DestinoService] Dados recebidos:', json.data);

    return json.data as DestinoImagem[];
  } catch (error) {
    console.log('[DestinoService] Erro na requisição:', error);
    return null;
  }
}