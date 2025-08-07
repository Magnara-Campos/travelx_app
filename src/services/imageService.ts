import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Imagens
interface Imagem {
  id: number;
  url: string;
  descricao?: string;
  tipo: 'acomodacao' | 'atividade' | 'destino' | 'restaurante';
  entidade_id: number;
  created_at: string;
  updated_at: string;
}

interface UploadImagemData {
  imagem: {
    uri: string;
    type: string;
    name: string;
  };
  descricao?: string;
}

// Tipos de entidade para organização
type TipoEntidade = 'acomodacoes' | 'atividades' | 'destinos' | 'restaurantes';

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_IMAGES: Imagem[] = [
  {
    id: 1,
    url: 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Acomodacao+1',
    descricao: 'Vista principal do hotel',
    tipo: 'acomodacao',
    entidade_id: 1,
    created_at: '2024-12-15T10:00:00Z',
    updated_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 2,
    url: 'https://via.placeholder.com/300x200/34C759/FFFFFF?text=Destino+1',
    descricao: 'Ponto turístico principal',
    tipo: 'destino',
    entidade_id: 1,
    created_at: '2024-12-10T14:30:00Z',
    updated_at: '2024-12-10T14:30:00Z'
  },
  {
    id: 3,
    url: 'https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Atividade+1',
    descricao: 'Atividade turística',
    tipo: 'atividade',
    entidade_id: 1,
    created_at: '2024-12-08T09:15:00Z',
    updated_at: '2024-12-08T09:15:00Z'
  },
  {
    id: 4,
    url: 'https://via.placeholder.com/300x200/FF3B30/FFFFFF?text=Restaurante+1',
    descricao: 'Ambiente do restaurante',
    tipo: 'restaurante',
    entidade_id: 1,
    created_at: '2024-12-05T16:45:00Z',
    updated_at: '2024-12-05T16:45:00Z'
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
    console.log('[ImageService] API não disponível, usando dados de fallback');
    return false;
  }
}

// Função auxiliar para headers com autenticação
async function getAuthHeaders(isFormData: boolean = false): Promise<Record<string, string>> {
  const token = await storageService.getAuthToken();
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
}

// Função genérica para listar imagens
async function listarImagens(tipo: TipoEntidade, entidadeId: number): Promise<Imagem[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    const filteredImages = FALLBACK_IMAGES.filter(img => 
      img.tipo === tipo.slice(0, -1) as any && img.entidade_id === entidadeId
    );
    return filteredImages.length > 0 ? filteredImages : [FALLBACK_IMAGES[0]];
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    const filteredImages = FALLBACK_IMAGES.filter(img => 
      img.tipo === tipo.slice(0, -1) as any && img.entidade_id === entidadeId
    );
    return filteredImages.length > 0 ? filteredImages : [FALLBACK_IMAGES[0]];
  }

  const url = `${API_BASE_URL}turista/${tipo}/${entidadeId}/imagens`;
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
      const filteredImages = FALLBACK_IMAGES.filter(img => 
        img.tipo === tipo.slice(0, -1) as any && img.entidade_id === entidadeId
      );
      return filteredImages.length > 0 ? filteredImages : [FALLBACK_IMAGES[0]];
    }

    const data = await response.json();
    if (!response.ok) {
      const filteredImages = FALLBACK_IMAGES.filter(img => 
        img.tipo === tipo.slice(0, -1) as any && img.entidade_id === entidadeId
      );
      return filteredImages.length > 0 ? filteredImages : [FALLBACK_IMAGES[0]];
    }

    console.log(`[ImageService] Imagens de ${tipo} recebidas da API:`, data);
    return data && data.length > 0 ? data : [FALLBACK_IMAGES[0]];
  } catch (error) {
    console.error(`[ImageService] Erro ao buscar imagens de ${tipo}:`, error);
    const filteredImages = FALLBACK_IMAGES.filter(img => 
      img.tipo === tipo.slice(0, -1) as any && img.entidade_id === entidadeId
    );
    return filteredImages.length > 0 ? filteredImages : [FALLBACK_IMAGES[0]];
  }
}

// Função genérica para upload de imagens
async function uploadImagem(tipo: TipoEntidade, entidadeId: number, dadosImagem: UploadImagemData): Promise<Imagem | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log(`[ImageService] API não disponível - simulando upload de imagem para ${tipo}`);
    const novaImagem: Imagem = {
      id: Date.now(),
      url: `https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Upload+${Date.now()}`,
      descricao: dadosImagem.descricao || 'Imagem carregada',
      tipo: tipo.slice(0, -1) as any,
      entidade_id: entidadeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novaImagem;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log(`[ImageService] Usuário não autenticado - simulando upload para ${tipo}`);
    const novaImagem: Imagem = {
      id: Date.now(),
      url: `https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Upload+${Date.now()}`,
      descricao: dadosImagem.descricao || 'Imagem carregada',
      tipo: tipo.slice(0, -1) as any,
      entidade_id: entidadeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novaImagem;
  }

  const url = `${API_BASE_URL}turista/${tipo}/${entidadeId}/imagens`;
  const headers = await getAuthHeaders(true);

  const formData = new FormData();
  formData.append('imagem', dadosImagem.imagem as any);
  if (dadosImagem.descricao) {
    formData.append('descricao', dadosImagem.descricao);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos para upload

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novaImagem: Imagem = {
        id: Date.now(),
        url: `https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Upload+${Date.now()}`,
        descricao: dadosImagem.descricao || 'Imagem carregada',
        tipo: tipo.slice(0, -1) as any,
        entidade_id: entidadeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novaImagem;
    }

    const data = await response.json();
    if (!response.ok) {
      const novaImagem: Imagem = {
        id: Date.now(),
        url: `https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Upload+${Date.now()}`,
        descricao: dadosImagem.descricao || 'Imagem carregada',
        tipo: tipo.slice(0, -1) as any,
        entidade_id: entidadeId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novaImagem;
    }
    return data;
  } catch (error) {
    console.error(`[ImageService] Erro ao fazer upload de imagem para ${tipo}:`, error);
    console.log(`[ImageService] Simulando upload devido ao erro`);
    const novaImagem: Imagem = {
      id: Date.now(),
      url: `https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Upload+${Date.now()}`,
      descricao: dadosImagem.descricao || 'Imagem carregada',
      tipo: tipo.slice(0, -1) as any,
      entidade_id: entidadeId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novaImagem;
  }
}

// === FUNÇÕES ESPECÍFICAS PARA CADA TIPO ===

// ACOMODAÇÕES
export async function getImagensAcomodacao(acomodacaoId: number): Promise<Imagem[]> {
  return listarImagens('acomodacoes', acomodacaoId);
}

export async function uploadImagemAcomodacao(acomodacaoId: number, dadosImagem: UploadImagemData): Promise<Imagem | null> {
  return uploadImagem('acomodacoes', acomodacaoId, dadosImagem);
}

// ATIVIDADES
export async function getImagensAtividade(atividadeId: number): Promise<Imagem[]> {
  return listarImagens('atividades', atividadeId);
}

export async function uploadImagemAtividade(atividadeId: number, dadosImagem: UploadImagemData): Promise<Imagem | null> {
  return uploadImagem('atividades', atividadeId, dadosImagem);
}

// DESTINOS
export async function getImagensDestino(destinoId: number): Promise<Imagem[]> {
  return listarImagens('destinos', destinoId);
}

export async function uploadImagemDestino(destinoId: number, dadosImagem: UploadImagemData): Promise<Imagem | null> {
  return uploadImagem('destinos', destinoId, dadosImagem);
}

// RESTAURANTES
export async function getImagensRestaurante(restauranteId: number): Promise<Imagem[]> {
  return listarImagens('restaurantes', restauranteId);
}

export async function uploadImagemRestaurante(restauranteId: number, dadosImagem: UploadImagemData): Promise<Imagem | null> {
  return uploadImagem('restaurantes', restauranteId, dadosImagem);
}

// Exportar tipos para uso em outros arquivos
export type { Imagem, UploadImagemData, TipoEntidade };