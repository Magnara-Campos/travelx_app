import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_ACOMODACOES = [
  {
    id: 1,
    nome: 'Hotel Copacabana Palace',
    descricao: 'Hotel de luxo em frente à praia de Copacabana',
    preco: '450.00',
    rating: 4.8,
    endereco: {
      latitude: -22.9736,
      longitude: -43.1864
    }
  },
  {
    id: 2,
    nome: 'Pousada Santorini',
    descricao: 'Pousada aconchegante no centro histórico',
    preco: '180.00',
    rating: 4.5,
    endereco: {
      latitude: -22.9068,
      longitude: -43.1729
    }
  },
  {
    id: 3,
    nome: 'Resort Bahia Marina',
    descricao: 'Resort all-inclusive com vista para o mar',
    preco: '320.00',
    rating: 4.7,
    endereco: {
      latitude: -12.9777,
      longitude: -38.5016
    }
  }
];

const FALLBACK_IMAGES = [
  {
    url: 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Hotel+1',
    descricao: 'Vista principal do hotel'
  },
  {
    url: 'https://via.placeholder.com/300x200/34C759/FFFFFF?text=Hotel+2',
    descricao: 'Quarto de luxo'
  }
];

// Função auxiliar para verificar se a API está disponível
async function isApiAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(`${API_BASE_URL}health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('[AcomodacaoService] API não disponível, usando dados de fallback');
    return false;
  }
}

// acomodacaoService.ts
export async function getAcomodacoes() {
  // Primeiro verifica se a API está disponível
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[AcomodacaoService] Usando dados de fallback');
    return FALLBACK_ACOMODACOES;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[AcomodacaoService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_ACOMODACOES;
  }

  const url = `${API_BASE_URL}turista/acomodacoes`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Verifica se a resposta é JSON válido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('[AcomodacaoService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_ACOMODACOES;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[AcomodacaoService] Erro da API, usando dados de fallback');
      return FALLBACK_ACOMODACOES;
    }
    
    console.log('[AcomodacaoService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_ACOMODACOES;
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao buscar acomodações:', error);
    console.log('[AcomodacaoService] Usando dados de fallback devido ao erro');
    return FALLBACK_ACOMODACOES;
  }
}

// Comparar acomodações
export async function compararAcomodacoes(ids: number[]) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    // Retorna dados de comparação simulados
    const selectedAcomodacoes = FALLBACK_ACOMODACOES.filter(item => ids.includes(item.id));
    return selectedAcomodacoes;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[AcomodacaoService] Usuário não autenticado');
    const selectedAcomodacoes = FALLBACK_ACOMODACOES.filter(item => ids.includes(item.id));
    return selectedAcomodacoes;
  }

  // Usando GET conforme a documentação da API
  const url = `${API_BASE_URL}turista/acomodacoes/comparar`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET', // Mudado de POST para GET
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const selectedAcomodacoes = FALLBACK_ACOMODACOES.filter(item => ids.includes(item.id));
      return selectedAcomodacoes;
    }

    const data = await response.json();
    if (!response.ok) {
      const selectedAcomodacoes = FALLBACK_ACOMODACOES.filter(item => ids.includes(item.id));
      return selectedAcomodacoes;
    }
    return data;
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao comparar acomodações:', error);
    const selectedAcomodacoes = FALLBACK_ACOMODACOES.filter(item => ids.includes(item.id));
    return selectedAcomodacoes;
  }
}

// Listar imagens de uma acomodação
export async function getAcomodacaoImagens(acomodacaoId: number) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    return FALLBACK_IMAGES;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    return FALLBACK_IMAGES;
  }

  const url = `${API_BASE_URL}turista/acomodacoes/${acomodacaoId}/imagens`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return FALLBACK_IMAGES;
    }

    const data = await response.json();
    if (!response.ok) return FALLBACK_IMAGES;
    return data && data.length > 0 ? data : FALLBACK_IMAGES;
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao buscar imagens:', error);
    return FALLBACK_IMAGES;
  }
}

// Adicionar imagem à acomodação
export async function addAcomodacaoImagem(acomodacaoId: number, imagem: { uri: string; type: string; name: string }, descricao: string) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[AcomodacaoService] API não disponível - não é possível adicionar imagem');
    return null;
  }

  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/acomodacoes/${acomodacaoId}/imagens`;
  const formData = new FormData();
  formData.append('imagem', imagem as any);
  formData.append('descricao', descricao);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos para upload

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao adicionar imagem:', error);
    return null;
  }
}