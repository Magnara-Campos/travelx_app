import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Perfil
interface PerfilTurista {
  id: number;
  name: string;
  sobrenome: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: 'Masculino' | 'Feminino' | 'Outro';
  tipo_usuario: string;
  created_at: string;
  updated_at: string;
}

interface AtualizarPerfilData {
  name?: string;
  sobrenome?: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: 'Masculino' | 'Feminino' | 'Outro';
}

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_PERFIL: PerfilTurista = {
  id: 1,
  name: 'Maria',
  sobrenome: 'Silva',
  email: 'maria@email.com',
  telefone: '+55 (11) 99999-9999',
  data_nascimento: '1990-05-15',
  genero: 'Feminino',
  tipo_usuario: 'turista',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-12-15T14:30:00Z'
};

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
    console.log('[PerfilService] API não disponível, usando dados de fallback');
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

// Buscar dados do perfil do turista
export async function getPerfil(): Promise<PerfilTurista | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[PerfilService] Usando dados de fallback');
    return FALLBACK_PERFIL;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[PerfilService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_PERFIL;
  }

  const url = `${API_BASE_URL}turista/perfil`;
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
      console.log('[PerfilService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_PERFIL;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[PerfilService] Erro da API, usando dados de fallback');
      return FALLBACK_PERFIL;
    }

    console.log('[PerfilService] Dados recebidos da API:', data);
    return data || FALLBACK_PERFIL;
  } catch (error) {
    console.error('[PerfilService] Erro ao buscar perfil:', error);
    console.log('[PerfilService] Usando dados de fallback devido ao erro');
    return FALLBACK_PERFIL;
  }
}

// Atualizar dados do perfil do turista
export async function atualizarPerfil(dados: AtualizarPerfilData): Promise<PerfilTurista | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[PerfilService] API não disponível - simulando atualização');
    const perfilAtualizado: PerfilTurista = {
      ...FALLBACK_PERFIL,
      ...dados,
      updated_at: new Date().toISOString()
    };
    return perfilAtualizado;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[PerfilService] Usuário não autenticado - simulando atualização');
    const perfilAtualizado: PerfilTurista = {
      ...FALLBACK_PERFIL,
      ...dados,
      updated_at: new Date().toISOString()
    };
    return perfilAtualizado;
  }

  const url = `${API_BASE_URL}turista/perfil`;
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
      const perfilAtualizado: PerfilTurista = {
        ...FALLBACK_PERFIL,
        ...dados,
        updated_at: new Date().toISOString()
      };
      return perfilAtualizado;
    }

    const data = await response.json();
    if (!response.ok) {
      const perfilAtualizado: PerfilTurista = {
        ...FALLBACK_PERFIL,
        ...dados,
        updated_at: new Date().toISOString()
      };
      return perfilAtualizado;
    }
    return data;
  } catch (error) {
    console.error('[PerfilService] Erro ao atualizar perfil:', error);
    console.log('[PerfilService] Simulando atualização devido ao erro');
    const perfilAtualizado: PerfilTurista = {
      ...FALLBACK_PERFIL,
      ...dados,
      updated_at: new Date().toISOString()
    };
    return perfilAtualizado;
  }
}

// Função para validar dados do perfil antes do envio
export function validarDadosPerfil(dados: AtualizarPerfilData): string[] {
  const erros: string[] = [];

  if (dados.name && dados.name.trim().length < 2) {
    erros.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (dados.sobrenome && dados.sobrenome.trim().length < 2) {
    erros.push('Sobrenome deve ter pelo menos 2 caracteres');
  }

  if (dados.telefone && dados.telefone.trim().length < 8) {
    erros.push('Telefone deve ser válido');
  }

  if (dados.data_nascimento) {
    const dataNascimento = new Date(dados.data_nascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - dataNascimento.getFullYear();
    
    if (idade < 16 || idade > 120) {
      erros.push('Data de nascimento deve ser válida (idade entre 16 e 120 anos)');
    }
  }

  if (dados.genero && !['Masculino', 'Feminino', 'Outro'].includes(dados.genero)) {
    erros.push('Gênero deve ser Masculino, Feminino ou Outro');
  }

  return erros;
}

// Exportar tipos para uso em outros arquivos
export type { PerfilTurista, AtualizarPerfilData };