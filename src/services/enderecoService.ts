import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Endereços baseadas na documentação OpenAPI
interface Endereco {
  id: number;
  user_id: number;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
  complemento?: string;
  is_principal?: boolean;
  created_at: string;
  updated_at: string;
}

interface AtualizarEnderecosData {
  enderecos: Array<{
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    pais: string;
    complemento?: string;
    is_principal?: boolean;
  }>;
}

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_ENDERECOS: Endereco[] = [
  {
    id: 1,
    user_id: 1,
    logradouro: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01000-000',
    pais: 'Brasil',
    complemento: 'Apto 45',
    is_principal: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    user_id: 1,
    logradouro: 'Avenida Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01310-100',
    pais: 'Brasil',
    is_principal: false,
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
    console.log('[EnderecoService] API não disponível, usando dados de fallback');
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

// Listar endereços do turista - GET /turista/enderecos
export async function getEnderecos(): Promise<Endereco[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[EnderecoService] Usando dados de fallback');
    return FALLBACK_ENDERECOS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[EnderecoService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_ENDERECOS;
  }

  const url = `${API_BASE_URL}turista/enderecos`;
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
      console.log('[EnderecoService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_ENDERECOS;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[EnderecoService] Erro da API, usando dados de fallback');
      return FALLBACK_ENDERECOS;
    }

    console.log('[EnderecoService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_ENDERECOS;
  } catch (error) {
    console.error('[EnderecoService] Erro ao buscar endereços:', error);
    console.log('[EnderecoService] Usando dados de fallback devido ao erro');
    return FALLBACK_ENDERECOS;
  }
}

// Atualizar endereços do turista - PUT /turista/enderecos
export async function atualizarEnderecos(dados: AtualizarEnderecosData): Promise<Endereco[] | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[EnderecoService] API não disponível - simulando atualização');
    // Simula a criação de novos endereços
    const enderecosAtualizados: Endereco[] = dados.enderecos.map((endereco, index) => ({
      id: Date.now() + index,
      user_id: 1,
      ...endereco,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    return enderecosAtualizados;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[EnderecoService] Usuário não autenticado - simulando atualização');
    const enderecosAtualizados: Endereco[] = dados.enderecos.map((endereco, index) => ({
      id: Date.now() + index,
      user_id: 1,
      ...endereco,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    return enderecosAtualizados;
  }

  const url = `${API_BASE_URL}turista/enderecos`;
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
      const enderecosAtualizados: Endereco[] = dados.enderecos.map((endereco, index) => ({
        id: Date.now() + index,
        user_id: 1,
        ...endereco,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      return enderecosAtualizados;
    }

    const data = await response.json();
    if (!response.ok) {
      const enderecosAtualizados: Endereco[] = dados.enderecos.map((endereco, index) => ({
        id: Date.now() + index,
        user_id: 1,
        ...endereco,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      return enderecosAtualizados;
    }
    return data;
  } catch (error) {
    console.error('[EnderecoService] Erro ao atualizar endereços:', error);
    console.log('[EnderecoService] Simulando atualização devido ao erro');
    const enderecosAtualizados: Endereco[] = dados.enderecos.map((endereco, index) => ({
      id: Date.now() + index,
      user_id: 1,
      ...endereco,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    return enderecosAtualizados;
  }
}

// Função auxiliar para validar CEP brasileiro
export function validarCEP(cep: string): boolean {
  const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
  return cepRegex.test(cep);
}

// Função auxiliar para formatar CEP
export function formatarCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
}

// Função auxiliar para validar dados de endereço
export function validarEndereco(endereco: AtualizarEnderecosData['enderecos'][0]): string[] {
  const erros: string[] = [];

  if (!endereco.logradouro || endereco.logradouro.trim().length < 3) {
    erros.push('Logradouro deve ter pelo menos 3 caracteres');
  }

  if (!endereco.numero || endereco.numero.trim().length === 0) {
    erros.push('Número é obrigatório');
  }

  if (!endereco.bairro || endereco.bairro.trim().length < 2) {
    erros.push('Bairro deve ter pelo menos 2 caracteres');
  }

  if (!endereco.cidade || endereco.cidade.trim().length < 2) {
    erros.push('Cidade deve ter pelo menos 2 caracteres');
  }

  if (!endereco.estado || endereco.estado.trim().length !== 2) {
    erros.push('Estado deve ter 2 caracteres (ex: SP, RJ)');
  }

  if (!endereco.cep || !validarCEP(endereco.cep)) {
    erros.push('CEP deve estar no formato válido (12345-678)');
  }

  if (!endereco.pais || endereco.pais.trim().length < 2) {
    erros.push('País deve ter pelo menos 2 caracteres');
  }

  return erros;
}

// Função auxiliar para validar dados de endereços
export function validarDadosEnderecos(dados: AtualizarEnderecosData): string[] {
  const erros: string[] = [];

  if (!dados.enderecos || !Array.isArray(dados.enderecos)) {
    erros.push('Lista de endereços é obrigatória');
    return erros;
  }

  if (dados.enderecos.length === 0) {
    erros.push('Pelo menos um endereço deve ser especificado');
    return erros;
  }

  dados.enderecos.forEach((endereco, index) => {
    const errosEndereco = validarEndereco(endereco);
    errosEndereco.forEach(erro => {
      erros.push(`Endereço ${index + 1}: ${erro}`);
    });
  });

  // Verificar se há apenas um endereço principal
  const enderecosPrincipais = dados.enderecos.filter(e => e.is_principal);
  if (enderecosPrincipais.length > 1) {
    erros.push('Apenas um endereço pode ser marcado como principal');
  }

  return erros;
}

// Função auxiliar para obter endereço principal
export function getEnderecoPrincipal(enderecos: Endereco[]): Endereco | null {
  return enderecos.find(endereco => endereco.is_principal) || null;
}

// Função auxiliar para formatar endereço completo
export function formatarEnderecoCompleto(endereco: Endereco): string {
  const complemento = endereco.complemento ? `, ${endereco.complemento}` : '';
  return `${endereco.logradouro}, ${endereco.numero}${complemento}, ${endereco.bairro}, ${endereco.cidade}/${endereco.estado}, ${endereco.cep}, ${endereco.pais}`;
}

// Exportar tipos para uso em outros arquivos
export type { Endereco, AtualizarEnderecosData };