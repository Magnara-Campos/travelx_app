import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Dados de fallback para quando a API não estiver disponível
const FALLBACK_RESERVAS = [
  {
    id: 1,
    data_inicio: '2024-12-20',
    data_fim: '2024-12-25',
    quantidade_pessoas: 2,
    valor_total: 850.00,
    status: 'confirmada',
    acomodacao_id: 1,
    acomodacao: {
      nome: 'Hotel Copacabana Palace'
    },
    created_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 2,
    data_inicio: '2025-01-15',
    data_fim: '2025-01-20',
    quantidade_pessoas: 4,
    valor_total: 1200.00,
    status: 'pendente',
    atividade_id: 1,
    atividade: {
      nome: 'Tour pelo Centro Histórico do Rio'
    },
    created_at: '2024-12-10T14:30:00Z'
  },
  {
    id: 3,
    data_inicio: '2025-02-05',
    data_fim: '2025-02-10',
    quantidade_pessoas: 3,
    valor_total: 950.00,
    status: 'confirmada',
    acomodacao_id: 2,
    acomodacao: {
      nome: 'Pousada Santorini'
    },
    created_at: '2024-12-08T09:15:00Z'
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
    console.log('[ReservasService] API não disponível, usando dados de fallback');
    return false;
  }
}

// Listar todas as reservas do usuário
export async function getReservas() {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ReservasService] Usando dados de fallback');
    return FALLBACK_RESERVAS;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ReservasService] Usuário não autenticado, usando dados de fallback');
    return FALLBACK_RESERVAS;
  }

  const url = `${API_BASE_URL}turista/reservas`;
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
      console.log('[ReservasService] Resposta não é JSON, usando dados de fallback');
      return FALLBACK_RESERVAS;
    }

    const data = await response.json();
    if (!response.ok) {
      console.log('[ReservasService] Erro da API, usando dados de fallback');
      return FALLBACK_RESERVAS;
    }

    console.log('[ReservasService] Dados recebidos da API:', data);
    return data && data.length > 0 ? data : FALLBACK_RESERVAS;
  } catch (error) {
    console.error('[ReservasService] Erro ao buscar reservas:', error);
    console.log('[ReservasService] Usando dados de fallback devido ao erro');
    return FALLBACK_RESERVAS;
  }
}

// Criar uma nova reserva
export async function criarReserva(reserva: {
  data_inicio: string;
  data_fim: string;
  quantidade_pessoas: number;
  acomodacao_id?: number;
  atividade_id?: number;
  valor_total: number;
}) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ReservasService] API não disponível - simulando criação de reserva');
    // Simula a criação retornando uma nova reserva com ID único
    const novaReserva = {
      id: Date.now(), // ID simulado baseado no timestamp
      ...reserva,
      status: 'pendente',
      created_at: new Date().toISOString()
    };
    return novaReserva;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ReservasService] Usuário não autenticado - simulando criação');
    const novaReserva = {
      id: Date.now(),
      ...reserva,
      status: 'pendente',
      created_at: new Date().toISOString()
    };
    return novaReserva;
  }

  const url = `${API_BASE_URL}turista/reservas`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(reserva),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const novaReserva = {
        id: Date.now(),
        ...reserva,
        status: 'pendente',
        created_at: new Date().toISOString()
      };
      return novaReserva;
    }

    const data = await response.json();
    if (!response.ok) {
      const novaReserva = {
        id: Date.now(),
        ...reserva,
        status: 'pendente',
        created_at: new Date().toISOString()
      };
      return novaReserva;
    }
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao criar reserva:', error);
    console.log('[ReservasService] Simulando criação devido ao erro');
    const novaReserva = {
      id: Date.now(),
      ...reserva,
      status: 'pendente',
      created_at: new Date().toISOString()
    };
    return novaReserva;
  }
}

// Buscar detalhes de uma reserva
export async function getReservaById(id: number) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    const reserva = FALLBACK_RESERVAS.find(r => r.id === id);
    return reserva || FALLBACK_RESERVAS[0];
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    const reserva = FALLBACK_RESERVAS.find(r => r.id === id);
    return reserva || FALLBACK_RESERVAS[0];
  }

  const url = `${API_BASE_URL}turista/reservas/${id}`;
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
      const reserva = FALLBACK_RESERVAS.find(r => r.id === id);
      return reserva || FALLBACK_RESERVAS[0];
    }

    const data = await response.json();
    if (!response.ok) {
      const reserva = FALLBACK_RESERVAS.find(r => r.id === id);
      return reserva || FALLBACK_RESERVAS[0];
    }
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao buscar reserva:', error);
    const reserva = FALLBACK_RESERVAS.find(r => r.id === id);
    return reserva || FALLBACK_RESERVAS[0];
  }
}

// Atualizar uma reserva
export async function atualizarReserva(id: number, dados: {
  data_inicio?: string;
  data_fim?: string;
  quantidade_pessoas?: number;
  status?: string;
}) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ReservasService] API não disponível - simulando atualização');
    return {
      id,
      ...dados,
      updated_at: new Date().toISOString()
    };
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ReservasService] Usuário não autenticado - simulando atualização');
    return {
      id,
      ...dados,
      updated_at: new Date().toISOString()
    };
  }

  const url = `${API_BASE_URL}turista/reservas/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

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
      return {
        id,
        ...dados,
        updated_at: new Date().toISOString()
      };
    }

    const data = await response.json();
    if (!response.ok) {
      return {
        id,
        ...dados,
        updated_at: new Date().toISOString()
      };
    }
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao atualizar reserva:', error);
    console.log('[ReservasService] Simulando atualização devido ao erro');
    return {
      id,
      ...dados,
      updated_at: new Date().toISOString()
    };
  }
}

// Deletar uma reserva
export async function deletarReserva(id: number) {
  const apiAvailable = await isApiAvailable();
  
  if (!apiAvailable) {
    console.log('[ReservasService] API não disponível - simulando exclusão');
    return true;
  }

  const token = await storageService.getAuthToken();
  if (!token) {
    console.log('[ReservasService] Usuário não autenticado - simulando exclusão');
    return true;
  }

  const url = `${API_BASE_URL}turista/reservas/${id}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
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
      console.log('[ReservasService] Erro da API ao deletar, simulando sucesso');
      return true;
    }
    return true;
  } catch (error) {
    console.error('[ReservasService] Erro ao deletar reserva:', error);
    console.log('[ReservasService] Simulando exclusão devido ao erro');
    return true;
  }
}
