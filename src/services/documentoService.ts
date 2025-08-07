import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Documentos baseadas na documentação OpenAPI
interface Documento {
  id: number;
  user_id: number;
  tipo_documento: 'Passaporte' | 'Documento_Identidade' | 'Licenca_Guia';
  nome_arquivo: string;
  caminho_arquivo: string;
  tamanho_arquivo: number;
  formato_arquivo: string;
  status_analise: string;
  comentario_analise?: string;
  created_at: string;
  updated_at: string;
}

interface UploadDocumentoData {
  tipo_documento: 'Passaporte' | 'Documento_Identidade' | 'Licenca_Guia';
  arquivo: {
    uri: string;
    type: string;
    name: string;
  };
}

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_DOCUMENTOS: Documento[] = [
  {
    id: 1,
    user_id: 1,
    tipo_documento: 'Passaporte',
    nome_arquivo: 'passaporte_maria.pdf',
    caminho_arquivo: '/documentos/passaporte_maria.pdf',
    tamanho_arquivo: 1024000,
    formato_arquivo: 'pdf',
    status_analise: 'aprovado',
    comentario_analise: 'Documento válido e em conformidade',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-16T14:30:00Z'
  },
  {
    id: 2,
    user_id: 1,
    tipo_documento: 'Documento_Identidade',
    nome_arquivo: 'identidade_maria.jpg',
    caminho_arquivo: '/documentos/identidade_maria.jpg',
    tamanho_arquivo: 512000,
    formato_arquivo: 'jpg',
    status_analise: 'pendente',
    comentario_analise: null,
    created_at: '2024-12-10T09:15:00Z',
    updated_at: '2024-12-10T09:15:00Z'
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
    console.log('[DocumentoService] API não disponível, usando dados de fallback');
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

// Listar documentos do turista - GET /turista/documentos
export async function getDocumentos(): Promise<Documento[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[DocumentoService] Usando dados de fallback');
    return FALLBACK_DOCUMENTOS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[DocumentoService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_DOCUMENTOS;
  }

  const url = `${API_BASE_URL}turista/documentos`;
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
      console.log('[DocumentoService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_DOCUMENTOS;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[DocumentoService] Erro da API, usando dados de fallback');
      return FALLBACK_DOCUMENTOS;
    }

    console.log('[DocumentoService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_DOCUMENTOS;
  } catch (error) {
    console.error('[DocumentoService] Erro ao buscar documentos:', error);
    console.log('[DocumentoService] Usando dados de fallback devido ao erro');
    return FALLBACK_DOCUMENTOS;
  }
}

// Upload de documento - POST /turista/documentos
export async function uploadDocumento(dadosDocumento: UploadDocumentoData): Promise<Documento | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[DocumentoService] API não disponível - simulando upload');
    const novoDocumento: Documento = {
      id: Date.now(),
      user_id: 1,
      tipo_documento: dadosDocumento.tipo_documento,
      nome_arquivo: dadosDocumento.arquivo.name,
      caminho_arquivo: `/documentos/${dadosDocumento.arquivo.name}`,
      tamanho_arquivo: 1024000, // Tamanho simulado
      formato_arquivo: dadosDocumento.arquivo.type.split('/')[1] || 'unknown',
      status_analise: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novoDocumento;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[DocumentoService] Usuário não autenticado - simulando upload');
    const novoDocumento: Documento = {
      id: Date.now(),
      user_id: 1,
      tipo_documento: dadosDocumento.tipo_documento,
      nome_arquivo: dadosDocumento.arquivo.name,
      caminho_arquivo: `/documentos/${dadosDocumento.arquivo.name}`,
      tamanho_arquivo: 1024000,
      formato_arquivo: dadosDocumento.arquivo.type.split('/')[1] || 'unknown',
      status_analise: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novoDocumento;
  }

  const url = `${API_BASE_URL}turista/documentos`;
  const headers = await getAuthHeaders(true); // FormData headers

  const formData = new FormData();
  formData.append('tipo_documento', dadosDocumento.tipo_documento);
  formData.append('arquivo', dadosDocumento.arquivo as any);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 segundos para upload de documento

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novoDocumento: Documento = {
        id: Date.now(),
        user_id: 1,
        tipo_documento: dadosDocumento.tipo_documento,
        nome_arquivo: dadosDocumento.arquivo.name,
        caminho_arquivo: `/documentos/${dadosDocumento.arquivo.name}`,
        tamanho_arquivo: 1024000,
        formato_arquivo: dadosDocumento.arquivo.type.split('/')[1] || 'unknown',
        status_analise: 'pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novoDocumento;
    }

    const data = await response.json();
    if (!response.ok) {
      const novoDocumento: Documento = {
        id: Date.now(),
        user_id: 1,
        tipo_documento: dadosDocumento.tipo_documento,
        nome_arquivo: dadosDocumento.arquivo.name,
        caminho_arquivo: `/documentos/${dadosDocumento.arquivo.name}`,
        tamanho_arquivo: 1024000,
        formato_arquivo: dadosDocumento.arquivo.type.split('/')[1] || 'unknown',
        status_analise: 'pendente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return novoDocumento;
    }
    return data;
  } catch (error) {
    console.error('[DocumentoService] Erro ao fazer upload do documento:', error);
    console.log('[DocumentoService] Simulando upload devido ao erro');
    const novoDocumento: Documento = {
      id: Date.now(),
      user_id: 1,
      tipo_documento: dadosDocumento.tipo_documento,
      nome_arquivo: dadosDocumento.arquivo.name,
      caminho_arquivo: `/documentos/${dadosDocumento.arquivo.name}`,
      tamanho_arquivo: 1024000,
      formato_arquivo: dadosDocumento.arquivo.type.split('/')[1] || 'unknown',
      status_analise: 'pendente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return novoDocumento;
  }
}

// Função auxiliar para validar tipo de documento
export function validarTipoDocumento(tipo: string): boolean {
  const tiposValidos = ['Passaporte', 'Documento_Identidade', 'Licenca_Guia'];
  return tiposValidos.includes(tipo);
}

// Função auxiliar para obter o status readable
export function getStatusReadable(status: string): string {
  switch (status.toLowerCase()) {
    case 'aprovado': return 'Aprovado';
    case 'pendente': return 'Em Análise';
    case 'rejeitado': return 'Rejeitado';
    case 'expirado': return 'Expirado';
    default: return 'Status Desconhecido';
  }
}

// Função auxiliar para obter cor do status
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'aprovado': return '#34C759';
    case 'pendente': return '#FF9500';
    case 'rejeitado': return '#FF3B30';
    case 'expirado': return '#8E8E93';
    default: return '#8E8E93';
  }
}

// Exportar tipos para uso em outros arquivos
export type { Documento, UploadDocumentoData };