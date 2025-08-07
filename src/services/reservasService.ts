import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Listar todas as reservas do usuário
export async function getReservas() {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/reservas`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao buscar reservas:', error);
    return null;
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
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/reservas`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(reserva),
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao criar reserva:', error);
    return null;
  }
}

// Buscar detalhes de uma reserva
export async function getReservaById(id: number) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/reservas/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao buscar reserva:', error);
    return null;
  }
}

// Atualizar uma reserva
export async function atualizarReserva(id: number, dados: {
  data_inicio?: string;
  data_fim?: string;
  quantidade_pessoas?: number;
  status?: string;
}) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/reservas/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(dados),
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[ReservasService] Erro ao atualizar reserva:', error);
    return null;
  }
}

// Deletar uma reserva
export async function deletarReserva(id: number) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/reservas/${id}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) return false;
    return true;
  } catch (error) {
    console.error('[ReservasService] Erro ao deletar reserva:', error);
    return false;
  }
}
