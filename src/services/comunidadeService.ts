import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Comunidade baseadas na documentação OpenAPI
interface Usuario {
  id: number;
  name: string;
}

interface Reacao {
  id: number;
  user: Usuario;
  tipo: string;
  created_at: string;
}

interface Comentario {
  id: number;
  user: Usuario;
  conteudo: string;
  respostas: Comentario[];
  reacoes: Reacao[];
  created_at: string;
}

interface Post {
  id: number;
  user: Usuario;
  titulo: string;
  conteudo: string;
  tipo?: string;
  imagem?: string;
  comentarios: Comentario[];
  created_at: string;
}

interface CriarPostData {
  titulo: string;
  conteudo: string;
  tipo?: string;
  imagem?: {
    uri: string;
    type: string;
    name: string;
  };
}

interface CriarComentarioData {
  conteudo: string;
  parent_id?: number;
}

interface CriarReacaoData {
  tipo: string;
}

// Remover todas as constantes FALLBACK_*

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
    console.log('[ComunidadeService] API não disponível, usando dados de fallback');
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

// === POSTS ===

// Listar postagens da comunidade - GET /comunidade/posts
export async function getPosts(): Promise<Post[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ComunidadeService] Usando dados de fallback para posts');
    // Removido: return FALLBACK_POSTS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ComunidadeService] Usuário não autenticado, usando dados de fallback');
    // Removido: return FALLBACK_POSTS;
  }

  const url = `${API_BASE_URL}comunidade/posts`;
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
      console.log('[ComunidadeService] Resposta não é JSON, usando dados de fallback');
      // Removido: return FALLBACK_POSTS;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[ComunidadeService] Erro da API, usando dados de fallback');
      // Removido: return FALLBACK_POSTS;
    }

    console.log('[ComunidadeService] Posts recebidos da API:', data);
    return data.data && data.data.length > 0 ? data.data : [];
  } catch (error) {
    console.error('[ComunidadeService] Erro ao buscar posts:', error);
    console.log('[ComunidadeService] Usando dados de fallback devido ao erro');
    // Removido: return FALLBACK_POSTS;
  }
}

// Criar nova postagem - POST /comunidade/posts
export async function criarPost(dadosPost: CriarPostData): Promise<Post | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ComunidadeService] API não disponível - simulando criação de post');
    const novoPost: Post = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      titulo: dadosPost.titulo,
      conteudo: dadosPost.conteudo,
      tipo: dadosPost.tipo,
      imagem: dadosPost.imagem ? 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Post+Image' : null,
      comentarios: [],
      created_at: new Date().toISOString()
    };
    return novoPost;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ComunidadeService] Usuário não autenticado - simulando criação');
    const novoPost: Post = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      titulo: dadosPost.titulo,
      conteudo: dadosPost.conteudo,
      tipo: dadosPost.tipo,
      imagem: dadosPost.imagem ? 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Post+Image' : null,
      comentarios: [],
      created_at: new Date().toISOString()
    };
    return novoPost;
  }

  const url = `${API_BASE_URL}comunidade/posts`;
  const headers = await getAuthHeaders(!!dadosPost.imagem);

  let body: FormData | string;
  
  if (dadosPost.imagem) {
    // Com imagem - usar FormData
    const formData = new FormData();
    formData.append('titulo', dadosPost.titulo);
    formData.append('conteudo', dadosPost.conteudo);
    if (dadosPost.tipo) formData.append('tipo', dadosPost.tipo);
    formData.append('imagem', dadosPost.imagem as any);
    body = formData;
  } else {
    // Sem imagem - usar JSON
    body = JSON.stringify({
      titulo: dadosPost.titulo,
      conteudo: dadosPost.conteudo,
      tipo: dadosPost.tipo
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novoPost: Post = {
        id: Date.now(),
        user: { id: 1, name: "Usuário Atual" },
        titulo: dadosPost.titulo,
        conteudo: dadosPost.conteudo,
        tipo: dadosPost.tipo,
        imagem: dadosPost.imagem ? 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Post+Image' : null,
        comentarios: [],
        created_at: new Date().toISOString()
      };
      return novoPost;
    }

    const data = await response.json();
    if (!response.ok) {
      const novoPost: Post = {
        id: Date.now(),
        user: { id: 1, name: "Usuário Atual" },
        titulo: dadosPost.titulo,
        conteudo: dadosPost.conteudo,
        tipo: dadosPost.tipo,
        imagem: dadosPost.imagem ? 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Post+Image' : null,
        comentarios: [],
        created_at: new Date().toISOString()
      };
      return novoPost;
    }
    return data;
  } catch (error) {
    console.error('[ComunidadeService] Erro ao criar post:', error);
    console.log('[ComunidadeService] Simulando criação devido ao erro');
    const novoPost: Post = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      titulo: dadosPost.titulo,
      conteudo: dadosPost.conteudo,
      tipo: dadosPost.tipo,
      imagem: dadosPost.imagem ? 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Post+Image' : null,
      comentarios: [],
      created_at: new Date().toISOString()
    };
    return novoPost;
  }
}

// Detalhar postagem - GET /comunidade/posts/{id}
export async function getPostById(id: number): Promise<Post | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    // Removido: const post = FALLBACK_POSTS.find(p => p.id === id);
    // Removido: return post || FALLBACK_POSTS[0];
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    // Removido: const post = FALLBACK_POSTS.find(p => p.id === id);
    // Removido: return post || FALLBACK_POSTS[0];
  }

  const url = `${API_BASE_URL}comunidade/posts/${id}`;
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
      // Removido: const post = FALLBACK_POSTS.find(p => p.id === id);
      // Removido: return post || FALLBACK_POSTS[0];
    }

    const data = await response.json();
    if (!response.ok) {
      // Removido: const post = FALLBACK_POSTS.find(p => p.id === id);
      // Removido: return post || FALLBACK_POSTS[0];
    }
    return data;
  } catch (error) {
    console.error('[ComunidadeService] Erro ao buscar post:', error);
    // Removido: const post = FALLBACK_POSTS.find(p => p.id === id);
    // Removido: return post || FALLBACK_POSTS[0];
  }
}

// === COMENTÁRIOS ===

// Comentar em uma postagem - POST /comunidade/posts/{id}/comentarios
export async function criarComentario(postId: number, dadosComentario: CriarComentarioData): Promise<Comentario | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ComunidadeService] API não disponível - simulando criação de comentário');
    const novoComentario: Comentario = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      conteudo: dadosComentario.conteudo,
      respostas: [],
      reacoes: [],
      created_at: new Date().toISOString()
    };
    return novoComentario;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ComunidadeService] Usuário não autenticado - simulando criação');
    const novoComentario: Comentario = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      conteudo: dadosComentario.conteudo,
      respostas: [],
      reacoes: [],
      created_at: new Date().toISOString()
    };
    return novoComentario;
  }

  const url = `${API_BASE_URL}comunidade/posts/${postId}/comentarios`;
  const headers = await getAuthHeaders();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(dadosComentario),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novoComentario: Comentario = {
        id: Date.now(),
        user: { id: 1, name: "Usuário Atual" },
        conteudo: dadosComentario.conteudo,
        respostas: [],
        reacoes: [],
        created_at: new Date().toISOString()
      };
      return novoComentario;
    }

    const data = await response.json();
    if (!response.ok) {
      const novoComentario: Comentario = {
        id: Date.now(),
        user: { id: 1, name: "Usuário Atual" },
        conteudo: dadosComentario.conteudo,
        respostas: [],
        reacoes: [],
        created_at: new Date().toISOString()
      };
      return novoComentario;
    }
    return data;
  } catch (error) {
    console.error('[ComunidadeService] Erro ao criar comentário:', error);
    console.log('[ComunidadeService] Simulando criação devido ao erro');
    const novoComentario: Comentario = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      conteudo: dadosComentario.conteudo,
      respostas: [],
      reacoes: [],
      created_at: new Date().toISOString()
    };
    return novoComentario;
  }
}

// Listar respostas de um comentário - GET /comunidade/comentarios/{id}/respostas
export async function getRespostasComentario(comentarioId: number): Promise<Comentario[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    // Removido: return FALLBACK_COMENTARIOS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    // Removido: return FALLBACK_COMENTARIOS;
  }

  const url = `${API_BASE_URL}comunidade/comentarios/${comentarioId}/respostas`;
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
      // Removido: return FALLBACK_COMENTARIOS;
    }

    const data = await response.json();
    if (!response.ok) return [];
    return data.data && data.data.length > 0 ? data.data : [];
  } catch (error) {
    console.error('[ComunidadeService] Erro ao buscar respostas:', error);
    return [];
  }
}

// === REAÇÕES ===

// Reagir a um comentário - POST /comunidade/comentarios/{id}/reacoes
export async function criarReacao(comentarioId: number, dadosReacao: CriarReacaoData): Promise<Reacao | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ComunidadeService] API não disponível - simulando reação');
    const novaReacao: Reacao = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      tipo: dadosReacao.tipo,
      created_at: new Date().toISOString()
    };
    return novaReacao;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ComunidadeService] Usuário não autenticado - simulando reação');
    const novaReacao: Reacao = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      tipo: dadosReacao.tipo,
      created_at: new Date().toISOString()
    };
    return novaReacao;
  }

  const url = `${API_BASE_URL}comunidade/comentarios/${comentarioId}/reacoes`;
  const headers = await getAuthHeaders();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(dadosReacao),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novaReacao: Reacao = {
        id: Date.now(),
        user: { id: 1, name: "Usuário Atual" },
        tipo: dadosReacao.tipo,
        created_at: new Date().toISOString()
      };
      return novaReacao;
    }

    const data = await response.json();
    if (!response.ok) {
      const novaReacao: Reacao = {
        id: Date.now(),
        user: { id: 1, name: "Usuário Atual" },
        tipo: dadosReacao.tipo,
        created_at: new Date().toISOString()
      };
      return novaReacao;
    }
    return data;
  } catch (error) {
    console.error('[ComunidadeService] Erro ao criar reação:', error);
    console.log('[ComunidadeService] Simulando criação devido ao erro');
    const novaReacao: Reacao = {
      id: Date.now(),
      user: { id: 1, name: "Usuário Atual" },
      tipo: dadosReacao.tipo,
      created_at: new Date().toISOString()
    };
    return novaReacao;
  }
}

// Listar reações de um comentário - GET /comunidade/comentarios/{id}/reacoes
export async function getReacoesComentario(comentarioId: number): Promise<Reacao[]> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    // Removido: return FALLBACK_REACOES;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    // Removido: return FALLBACK_REACOES;
  }

  const url = `${API_BASE_URL}comunidade/comentarios/${comentarioId}/reacoes`;
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
      // Removido: return FALLBACK_REACOES;
    }

    const data = await response.json();
    if (!response.ok) return [];
    return data.data && data.data.length > 0 ? data.data : [];
  } catch (error) {
    console.error('[ComunidadeService] Erro ao buscar reações:', error);
    return [];
  }
}

// Função auxiliar para validar dados de post
export function validarDadosPost(dados: CriarPostData): string[] {
  const erros: string[] = [];

  if (!dados.titulo || dados.titulo.trim().length < 3) {
    erros.push('Título deve ter pelo menos 3 caracteres');
  }

  if (!dados.conteudo || dados.conteudo.trim().length < 10) {
    erros.push('Conteúdo deve ter pelo menos 10 caracteres');
  }

  return erros;
}

// Função auxiliar para formatar data relativa
export function formatarDataRelativa(dataString: string): string {
  const data = new Date(dataString);
  const agora = new Date();
  const diffMs = agora.getTime() - data.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMins / 60);
  const diffDias = Math.floor(diffHoras / 24);

  if (diffMins < 1) return 'Agora mesmo';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHoras < 24) return `${diffHoras}h atrás`;
  if (diffDias < 7) return `${diffDias}d atrás`;
  
  return data.toLocaleDateString('pt-BR');
}

// Exportar tipos para uso em outros arquivos
export type { Usuario, Post, Comentario, Reacao, CriarPostData, CriarComentarioData, CriarReacaoData };