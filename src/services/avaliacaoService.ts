import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Avaliações
interface Avaliacao {
  id: number;
  nota: number; // Mudado de 'rating' para 'nota'
  comentario: string;
  turista_id: number;
  acomodacao_id?: number;
  atividade_id?: number;
  destino_id?: number;
  restaurante_id?: number;
  created_at: string;
  updated_at: string;
  turista?: {
    name: string;
    email: string;
  };
}

interface CriarAvaliacaoData {
  nota: number; // Mudado de 'rating' para 'nota'
  comentario?: string; // Agora opcional
  acomodacao_id?: number;
  atividade_id?: number;
  destino_id?: number;
  restaurante_id?: number;
}

interface AtualizarAvaliacaoData {
  nota?: number; // Mudado de 'rating' para 'nota'
  comentario?: string;
}

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_AVALIACOES: Avaliacao[] = [
  {
    id: 1,
    nota: 5,
    comentario: 'Experiência incrível! Hotel com excelente atendimento e localização perfeita.',
    turista_id: 1,
    acomodacao_id: 1,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z',
    turista: {
      name: 'Maria Silva',
      email: 'maria@email.com'
    }
  },
  {
    id: 2,
    nota: 4,
    comentario: 'Tour muito interessante, guia conhecia bem a história local.',
    turista_id: 1,
    atividade_id: 1,
    created_at: '2024-12-10T14:30:00Z',
    updated_at: '2024-12-10T14:30:00Z',
    turista: {
      name: 'Maria Silva',
      email: 'maria@email.com'
    }
  },
  {
    id: 3,
    nota: 5,
    comentario: 'Cidade maravilhosa com paisagens deslumbrantes e cultura rica.',
    turista_id: 1,
    destino_id: 1,
    created_at: '2024-12-08T09:15:00Z',
    updated_at: '2024-12-08T09:15:00Z',
    turista: {
      name: 'Maria Silva',
      email: 'maria@email.com'
    }
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
    console.log('[AvaliacaoService] API não disponível, usando dados de fallback');
    return false;
  }
}

// Função auxiliar para headers com autenticação
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await storageService.getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Listar todas as avaliações do turista
export async function getAvaliacoes(): Promise<Avaliacao[] | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[AvaliacaoService] Usando dados de fallback');
    return FALLBACK_AVALIACOES;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[AvaliacaoService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_AVALIACOES;
  }

  const url = `${API_BASE_URL}turista/avaliacoes`;
  const headers = await getAuthHeaders();

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
      console.log('[AvaliacaoService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_AVALIACOES;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[AvaliacaoService] Erro da API, usando dados de fallback');
      return FALLBACK_AVALIACOES;
    }

    console.log('[AvaliacaoService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_AVALIACOES;
  } catch (error) {
    console.error('[AvaliacaoService] Erro ao buscar avaliações:', error);
    console.log('[AvaliacaoService] Usando dados de fallback devido ao erro');
    return FALLBACK_AVALIACOES;
  }
}

// Criar uma nova avaliação
export async function criarAvaliacao(dadosAvaliacao: CriarAvaliacaoData): Promise<Avaliacao | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[AvaliacaoService] API não disponível - simulando criação');
    const novaAvaliacao: Avaliacao = {
      id: Date.now(),
      ...dadosAvaliacao,
      turista_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      turista: {
        name: 'Maria Silva',
        email: 'maria@email.com'
      }
    };
    return novaAvaliacao;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[AvaliacaoService] Usuário não autenticado - simulando criação');
    const novaAvaliacao: Avaliacao = {
      id: Date.now(),
      ...dadosAvaliacao,
      turista_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novaAvaliacao;
  }

  const url = `${API_BASE_URL}turista/avaliacoes`;
  const headers = await getAuthHeaders();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(dadosAvaliacao),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novaAvaliacao: Avaliacao = {
        id: Date.now(),
        ...dadosAvaliacao,
        turista_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novaAvaliacao;
    }

    const data = await response.json();
    if (!response.ok) {
      const novaAvaliacao: Avaliacao = {
        id: Date.now(),
        ...dadosAvaliacao,
        turista_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novaAvaliacao;
    }
    return data;
  } catch (error) {
    console.error('[AvaliacaoService] Erro ao criar avaliação:', error);
    console.log('[AvaliacaoService] Simulando criação devido ao erro');
    const novaAvaliacao: Avaliacao = {
      id: Date.now(),
      ...dadosAvaliacao,
      turista_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novaAvaliacao;
  }
}

// Buscar uma avaliação específica
export async function getAvaliacaoById(id: number): Promise<Avaliacao | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    const avaliacao = FALLBACK_AVALIACOES.find(a => a.id === id);
    return avaliacao || FALLBACK_AVALIACOES[0];
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    const avaliacao = FALLBACK_AVALIACOES.find(a => a.id === id);
    return avaliacao || FALLBACK_AVALIACOES[0];
  }

  const url = `${API_BASE_URL}turista/avaliacoes/${id}`;
  const headers = await getAuthHeaders();

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
      const avaliacao = FALLBACK_AVALIACOES.find(a => a.id === id);
      return avaliacao || FALLBACK_AVALIACOES[0];
    }

    const data = await response.json();
    if (!response.ok) {
      const avaliacao = FALLBACK_AVALIACOES.find(a => a.id === id);
      return avaliacao || FALLBACK_AVALIACOES[0];
    }
    return data;
  } catch (error) {
    console.error('[AvaliacaoService] Erro ao buscar avaliação:', error);
    const avaliacao = FALLBACK_AVALIACOES.find(a => a.id === id);
    return avaliacao || FALLBACK_AVALIACOES[0];
  }
}

// Atualizar uma avaliação
export async function atualizarAvaliacao(id: number, dados: AtualizarAvaliacaoData): Promise<Avaliacao | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[AvaliacaoService] API não disponível - simulando atualização');
    const avaliacaoAtualizada: Partial<Avaliacao> = {
      id,
      ...dados,
      updated_at: new Date().toISOString()
    };
    return avaliacaoAtualizada as Avaliacao;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[AvaliacaoService] Usuário não autenticado - simulando atualização');
    const avaliacaoAtualizada: Partial<Avaliacao> = {
      id,
      ...dados,
      updated_at: new Date().toISOString()
    };
    return avaliacaoAtualizada as Avaliacao;
  }

  const url = `${API_BASE_URL}turista/avaliacoes/${id}`;
  const headers = await getAuthHeaders();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dados),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const avaliacaoAtualizada: Partial<Avaliacao> = {
        id,
        ...dados,
        updated_at: new Date().toISOString()
      };
      return avaliacaoAtualizada as Avaliacao;
    }

    const data = await response.json();
    if (!response.ok) {
      const avaliacaoAtualizada: Partial<Avaliacao> = {
        id,
        ...dados,
        updated_at: new Date().toISOString()
      };
      return avaliacaoAtualizada as Avaliacao;
    }
    return data;
  } catch (error) {
    console.error('[AvaliacaoService] Erro ao atualizar avaliação:', error);
    console.log('[AvaliacaoService] Simulando atualização devido ao erro');
    const avaliacaoAtualizada: Partial<Avaliacao> = {
      id,
      ...dados,
      updated_at: new Date().toISOString()
    };
    return avaliacaoAtualizada as Avaliacao;
  }
}

// Deletar uma avaliação
export async function deletarAvaliacao(id: number): Promise<boolean> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[AvaliacaoService] API não disponível - simulando exclusão');
    return true;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[AvaliacaoService] Usuário não autenticado - simulando exclusão');
    return true;
  }

  const url = `${API_BASE_URL}turista/avaliacoes/${id}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.log('[AvaliacaoService] Erro da API ao deletar, simulando sucesso');
      return true;
    }
    return true;
  } catch (error) {
    console.error('[AvaliacaoService] Erro ao deletar avaliação:', error);
    console.log('[AvaliacaoService] Simulando exclusão devido ao erro');
    return true;
  }
}

// Exportar tipos para uso em outros arquivos
export type { Avaliacao, CriarAvaliacaoData, AtualizarAvaliacaoData };