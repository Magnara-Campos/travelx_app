import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_DESTINOS = [
  {
    id: 1,
    nome: 'Rio de Janeiro',
    descricao: 'Cidade maravilhosa com praias icônicas, Cristo Redentor e Pão de Açúcar',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    rating: 4.9,
    endereco: {
      latitude: -22.9068,
      longitude: -43.1729
    }
  },
  {
    id: 2,
    nome: 'São Paulo',
    descricao: 'Metrópole vibrante com rica vida cultural, gastronomia e negócios',
    cidade: 'São Paulo',
    estado: 'SP',
    rating: 4.6,
    endereco: {
      latitude: -23.5505,
      longitude: -46.6333
    }
  },
  {
    id: 3,
    nome: 'Salvador',
    descricao: 'Capital baiana com centro histórico patrimônio da humanidade',
    cidade: 'Salvador',
    estado: 'BA',
    rating: 4.7,
    endereco: {
      latitude: -12.9777,
      longitude: -38.5016
    }
  },
  {
    id: 4,
    nome: 'Florianópolis',
    descricao: 'Ilha da magia com praias paradisíacas e natureza exuberante',
    cidade: 'Florianópolis',
    estado: 'SC',
    rating: 4.8,
    endereco: {
      latitude: -27.5954,
      longitude: -48.5480
    }
  }
];

const FALLBACK_DESTINO_IMAGES = [
  {
    url: 'https://via.placeholder.com/300x200/34C759/FFFFFF?text=Destino+1',
    descricao: 'Vista principal do destino'
  },
  {
    url: 'https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Destino+2',
    descricao: 'Ponto turístico'
  }
];

// Função auxiliar para verificar se a API está disponível
async function isApiAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${API_BASE_URL}health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.log('[DestinoService] API não disponível, usando dados de fallback');
    return false;
  }
}

// Listar destinos disponíveis
export async function getDestinos() {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[DestinoService] Usando dados de fallback');
    return FALLBACK_DESTINOS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[DestinoService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_DESTINOS;
  }

  const url = `${API_BASE_URL}turista/destinos`;
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
      console.log('[DestinoService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_DESTINOS;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[DestinoService] Erro da API, usando dados de fallback');
      return FALLBACK_DESTINOS;
    }

    console.log('[DestinoService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_DESTINOS;
  } catch (error) {
    console.error('[DestinoService] Erro ao buscar destinos:', error);
    console.log('[DestinoService] Usando dados de fallback devido ao erro');
    return FALLBACK_DESTINOS;
  }
}

// Buscar detalhes de um destino específico
export async function getDestinoById(destinoId: number) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    const destino = FALLBACK_DESTINOS.find(d => d.id === destinoId);
    return destino || FALLBACK_DESTINOS[0];
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    const destino = FALLBACK_DESTINOS.find(d => d.id === destinoId);
    return destino || FALLBACK_DESTINOS[0];
  }

  const url = `${API_BASE_URL}turista/destinos/${destinoId}`;
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
      const destino = FALLBACK_DESTINOS.find(d => d.id === destinoId);
      return destino || FALLBACK_DESTINOS[0];
    }

    const data = await response.json();
    if (!response.ok) {
      const destino = FALLBACK_DESTINOS.find(d => d.id === destinoId);
      return destino || FALLBACK_DESTINOS[0];
    }
    return data;
  } catch (error) {
    console.error('[DestinoService] Erro ao buscar destino:', error);
    const destino = FALLBACK_DESTINOS.find(d => d.id === destinoId);
    return destino || FALLBACK_DESTINOS[0];
  }
}

// Lista as imagens de um destino
export async function getDestinoImagens(destinoId: number) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    return FALLBACK_DESTINO_IMAGES;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    return FALLBACK_DESTINO_IMAGES;
  }

  const url = `${API_BASE_URL}turista/destinos/${destinoId}/imagens`;
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
      return FALLBACK_DESTINO_IMAGES;
    }

    const data = await response.json();
    if (!response.ok) return FALLBACK_DESTINO_IMAGES;
    return data && data.length > 0 ? data : FALLBACK_DESTINO_IMAGES;
  } catch (error) {
    console.error('[DestinoService] Erro ao buscar imagens:', error);
    return FALLBACK_DESTINO_IMAGES;
  }
}

// Adiciona uma imagem a um destino
export async function addDestinoImagem(destinoId: number, imagem: { uri: string; type: string; name: string }) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[DestinoService] API não disponível - não é possível adicionar imagem');
    return null;
  }

  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/destinos/${destinoId}/imagens`;
  const formData = new FormData();
  formData.append('imagem', imagem as any);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

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
    console.error('[DestinoService] Erro ao adicionar imagem:', error);
    return null;
  }
}
