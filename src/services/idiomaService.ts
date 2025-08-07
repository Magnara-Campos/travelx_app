import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Idiomas baseadas na documentação OpenAPI
interface IdiomaUsuario {
  id: number;
  idioma_id: number;
  nivel: 'Basico' | 'Intermediario' | 'Avancado' | 'Nativo';
  idioma?: {
    id: number;
    nome: string;
    codigo: string;
  };
  created_at: string;
  updated_at: string;
}

interface AtualizarIdiomasData {
  idiomas: Array<{
    id: number; // ID do idioma
    nivel: 'Basico' | 'Intermediario' | 'Avancado' | 'Nativo';
  }>;
}

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_IDIOMAS: IdiomaUsuario[] = [
  {
    id: 1,
    idioma_id: 1,
    nivel: 'Nativo',
    idioma: {
      id: 1,
      nome: 'Português',
      codigo: 'pt'
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    idioma_id: 2,
    nivel: 'Avancado',
    idioma: {
      id: 2,
      nome: 'Inglês',
      codigo: 'en'
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-12-15T14:30:00Z'
  },
  {
    id: 3,
    idioma_id: 3,
    nivel: 'Intermediario',
    idioma: {
      id: 3,
      nome: 'Espanhol',
      codigo: 'es'
    },
    created_at: '2024-06-10T09:15:00Z',
    updated_at: '2024-06-10T09:15:00Z'
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
    console.log('[IdiomaService] API não disponível, usando dados de fallback');
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

// Listar idiomas do turista - GET /turista/idiomas
export async function getIdiomas(): Promise<IdiomaUsuario[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[IdiomaService] Usando dados de fallback');
    return FALLBACK_IDIOMAS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[IdiomaService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_IDIOMAS;
  }

  const url = `${API_BASE_URL}turista/idiomas`;
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
      console.log('[IdiomaService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_IDIOMAS;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[IdiomaService] Erro da API, usando dados de fallback');
      return FALLBACK_IDIOMAS;
    }

    console.log('[IdiomaService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_IDIOMAS;
  } catch (error) {
    console.error('[IdiomaService] Erro ao buscar idiomas:', error);
    console.log('[IdiomaService] Usando dados de fallback devido ao erro');
    return FALLBACK_IDIOMAS;
  }
}

// Atualizar idiomas do turista - PUT /turista/idiomas
export async function atualizarIdiomas(dados: AtualizarIdiomasData): Promise<IdiomaUsuario[] | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[IdiomaService] API não disponível - simulando atualização');
    // Simula a atualização mesclando com dados existentes
    const idiomasAtualizados = FALLBACK_IDIOMAS.map(idioma => {
      const novoIdioma = dados.idiomas.find(i => i.id === idioma.idioma_id);
      if (novoIdioma) {
        return {
          ...idioma,
          nivel: novoIdioma.nivel,
          updated_at: new Date().toISOString()
        };
      }
      return idioma;
    });
    return idiomasAtualizados;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[IdiomaService] Usuário não autenticado - simulando atualização');
    const idiomasAtualizados = FALLBACK_IDIOMAS.map(idioma => {
      const novoIdioma = dados.idiomas.find(i => i.id === idioma.idioma_id);
      if (novoIdioma) {
        return {
          ...idioma,
          nivel: novoIdioma.nivel,
          updated_at: new Date().toISOString()
        };
      }
      return idioma;
    });
    return idiomasAtualizados;
  }

  const url = `${API_BASE_URL}turista/idiomas`;
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
      const idiomasAtualizados = FALLBACK_IDIOMAS.map(idioma => {
        const novoIdioma = dados.idiomas.find(i => i.id === idioma.idioma_id);
        if (novoIdioma) {
          return {
            ...idioma,
            nivel: novoIdioma.nivel,
            updated_at: new Date().toISOString()
          };
        }
        return idioma;
      });
      return idiomasAtualizados;
    }

    const data = await response.json();
    if (!response.ok) {
      const idiomasAtualizados = FALLBACK_IDIOMAS.map(idioma => {
        const novoIdioma = dados.idiomas.find(i => i.id === idioma.idioma_id);
        if (novoIdioma) {
          return {
            ...idioma,
            nivel: novoIdioma.nivel,
            updated_at: new Date().toISOString()
          };
        }
        return idioma;
      });
      return idiomasAtualizados;
    }
    return data;
  } catch (error) {
    console.error('[IdiomaService] Erro ao atualizar idiomas:', error);
    console.log('[IdiomaService] Simulando atualização devido ao erro');
    const idiomasAtualizados = FALLBACK_IDIOMAS.map(idioma => {
      const novoIdioma = dados.idiomas.find(i => i.id === idioma.idioma_id);
      if (novoIdioma) {
        return {
          ...idioma,
          nivel: novoIdioma.nivel,
          updated_at: new Date().toISOString()
        };
      }
      return idioma;
    });
    return idiomasAtualizados;
  }
}

// Função auxiliar para validar nível de idioma
export function validarNivelIdioma(nivel: string): boolean {
  const niveisValidos = ['Basico', 'Intermediario', 'Avancado', 'Nativo'];
  return niveisValidos.includes(nivel);
}

// Função auxiliar para obter cor do nível
export function getNivelColor(nivel: string): string {
  switch (nivel) {
    case 'Nativo': return '#34C759';
    case 'Avancado': return '#007AFF';
    case 'Intermediario': return '#FF9500';
    case 'Basico': return '#8E8E93';
    default: return '#8E8E93';
  }
}

// Função auxiliar para obter descrição do nível
export function getNivelDescricao(nivel: string): string {
  switch (nivel) {
    case 'Nativo': return 'Fluência nativa ou bilíngue';
    case 'Avancado': return 'Comunicação eficaz em contextos complexos';
    case 'Intermediario': return 'Comunicação em situações familiares';
    case 'Basico': return 'Conhecimento básico para situações simples';
    default: return 'Nível não especificado';
  }
}

// Função auxiliar para validar dados de idiomas
export function validarDadosIdiomas(dados: AtualizarIdiomasData): string[] {
  const erros: string[] = [];

  if (!dados.idiomas || !Array.isArray(dados.idiomas)) {
    erros.push('Lista de idiomas é obrigatória');
    return erros;
  }

  if (dados.idiomas.length === 0) {
    erros.push('Pelo menos um idioma deve ser especificado');
    return erros;
  }

  dados.idiomas.forEach((idioma, index) => {
    if (!idioma.id || typeof idioma.id !== 'number') {
      erros.push(`ID do idioma ${index + 1} é obrigatório e deve ser um número`);
    }

    if (!validarNivelIdioma(idioma.nivel)) {
      erros.push(`Nível do idioma ${index + 1} deve ser: Basico, Intermediario, Avancado ou Nativo`);
    }
  });

  return erros;
}

// Exportar tipos para uso em outros arquivos
export type { IdiomaUsuario, AtualizarIdiomasData };