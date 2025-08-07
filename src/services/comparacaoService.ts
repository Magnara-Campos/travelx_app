import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Interfaces para Comparação baseadas na documentação OpenAPI
interface RestauranteComparacao {
  id: number;
  nome: string;
  preco_medio_noite: number;
  avaliacao_media: number;
  imagem?: string;
  cidade?: string;
  tipo?: string;
  descricao?: string;
}

interface ComparacaoRestaurantes {
  mais_barato: RestauranteComparacao;
  melhor_avaliado: RestauranteComparacao;
  lista: RestauranteComparacao[];
}

interface ParametrosComparacao {
  cidade?: string;
  tipo?: string;
}

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_COMPARACAO: ComparacaoRestaurantes = {
  mais_barato: {
    id: 10,
    nome: 'Restaurante Popular',
    preco_medio_noite: 20,
    avaliacao_media: 3.0,
    imagem: 'https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Restaurante+Popular',
    cidade: 'São Paulo',
    tipo: 'Casual',
    descricao: 'Restaurante com preços acessíveis e comida caseira'
  },
  melhor_avaliado: {
    id: 12,
    nome: 'Restaurante Gourmet',
    preco_medio_noite: 120,
    avaliacao_media: 4.8,
    imagem: 'https://via.placeholder.com/300x200/34C759/FFFFFF?text=Restaurante+Gourmet',
    cidade: 'São Paulo',
    tipo: 'Fine Dining',
    descricao: 'Restaurante refinado com culinária internacional'
  },
  lista: [
    {
      id: 10,
      nome: 'Restaurante Popular',
      preco_medio_noite: 20,
      avaliacao_media: 3.0,
      imagem: 'https://via.placeholder.com/300x200/FF9500/FFFFFF?text=Restaurante+Popular',
      cidade: 'São Paulo',
      tipo: 'Casual'
    },
    {
      id: 11,
      nome: 'Bistro Central',
      preco_medio_noite: 65,
      avaliacao_media: 4.2,
      imagem: 'https://via.placeholder.com/300x200/007AFF/FFFFFF?text=Bistro+Central',
      cidade: 'São Paulo',
      tipo: 'Bistro'
    },
    {
      id: 12,
      nome: 'Restaurante Gourmet',
      preco_medio_noite: 120,
      avaliacao_media: 4.8,
      imagem: 'https://via.placeholder.com/300x200/34C759/FFFFFF?text=Restaurante+Gourmet',
      cidade: 'São Paulo',
      tipo: 'Fine Dining'
    }
  ]
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
    console.log('[ComparacaoService] API não disponível, usando dados de fallback');
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

// Comparar restaurantes - GET /turista/restaurantes/comparar
export async function compararRestaurantes(parametros: ParametrosComparacao = {}): Promise<ComparacaoRestaurantes | null> {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ComparacaoService] Usando dados de fallback');
    return FALLBACK_COMPARACAO;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ComparacaoService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_COMPARACAO;
  }

  // Construir URL com parâmetros de query
  const url = new URL(`${API_BASE_URL}turista/restaurantes/comparar`);
  if (parametros.cidade) {
    url.searchParams.append('cidade', parametros.cidade);
  }
  if (parametros.tipo) {
    url.searchParams.append('tipo', parametros.tipo);
  }

  const headers = await getAuthHeaders();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log('[ComparacaoService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_COMPARACAO;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[ComparacaoService] Erro da API, usando dados de fallback');
      return FALLBACK_COMPARACAO;
    }

    console.log('[ComparacaoService] Dados recebidos da API:', data);
    return data || FALLBACK_COMPARACAO;
  } catch (error) {
    console.error('[ComparacaoService] Erro ao comparar restaurantes:', error);
    console.log('[ComparacaoService] Usando dados de fallback devido ao erro');
    return FALLBACK_COMPARACAO;
  }
}

// Função auxiliar para obter faixa de preço
export function getFaixaPreco(preco: number): string {
  if (preco <= 30) return 'Econômico';
  if (preco <= 60) return 'Moderado';
  if (preco <= 100) return 'Caro';
  return 'Muito Caro';
}

// Função auxiliar para obter cor da faixa de preço
export function getCorFaixaPreco(preco: number): string {
  if (preco <= 30) return '#34C759';
  if (preco <= 60) return '#FF9500';
  if (preco <= 100) return '#FF3B30';
  return '#8E8E93';
}

// Função auxiliar para obter classificação por estrelas
export function getClassificacaoEstrelas(avaliacao: number): string {
  if (avaliacao >= 4.5) return '⭐⭐⭐⭐⭐ Excelente';
  if (avaliacao >= 4.0) return '⭐⭐⭐⭐ Muito Bom';
  if (avaliacao >= 3.5) return '⭐⭐⭐ Bom';
  if (avaliacao >= 3.0) return '⭐⭐ Regular';
  return '⭐ Ruim';
}

// Função auxiliar para obter cor da avaliação
export function getCorAvaliacao(avaliacao: number): string {
  if (avaliacao >= 4.5) return '#34C759';
  if (avaliacao >= 4.0) return '#007AFF';
  if (avaliacao >= 3.5) return '#FF9500';
  if (avaliacao >= 3.0) return '#8E8E93';
  return '#FF3B30';
}

// Função auxiliar para calcular economia
export function calcularEconomia(precoAtual: number, precoComparacao: number): {
  economia: number;
  percentual: number;
  texto: string;
} {
  const economia = precoComparacao - precoAtual;
  const percentual = economia > 0 ? (economia / precoComparacao) * 100 : 0;
  
  let texto = '';
  if (economia > 0) {
    texto = `Economia de R$ ${economia.toFixed(2)} (${percentual.toFixed(0)}%)`;
  } else if (economia < 0) {
    texto = `R$ ${Math.abs(economia).toFixed(2)} a mais`;
  } else {
    texto = 'Mesmo preço';
  }

  return { economia, percentual, texto };
}

// Função auxiliar para ordenar restaurantes por critério
export function ordenarRestaurantes(
  restaurantes: RestauranteComparacao[], 
  criterio: 'preco' | 'avaliacao' | 'nome'
): RestauranteComparacao[] {
  return [...restaurantes].sort((a, b) => {
    switch (criterio) {
      case 'preco':
        return a.preco_medio_noite - b.preco_medio_noite;
      case 'avaliacao':
        return b.avaliacao_media - a.avaliacao_media;
      case 'nome':
        return a.nome.localeCompare(b.nome);
      default:
        return 0;
    }
  });
}

// Função auxiliar para filtrar restaurantes
export function filtrarRestaurantes(
  restaurantes: RestauranteComparacao[],
  filtros: {
    precoMin?: number;
    precoMax?: number;
    avaliacaoMin?: number;
    tipo?: string;
    cidade?: string;
  }
): RestauranteComparacao[] {
  return restaurantes.filter(restaurante => {
    if (filtros.precoMin && restaurante.preco_medio_noite < filtros.precoMin) return false;
    if (filtros.precoMax && restaurante.preco_medio_noite > filtros.precoMax) return false;
    if (filtros.avaliacaoMin && restaurante.avaliacao_media < filtros.avaliacaoMin) return false;
    if (filtros.tipo && restaurante.tipo !== filtros.tipo) return false;
    if (filtros.cidade && restaurante.cidade !== filtros.cidade) return false;
    return true;
  });
}

// Exportar tipos para uso em outros arquivos
export type { RestauranteComparacao, ComparacaoRestaurantes, ParametrosComparacao };