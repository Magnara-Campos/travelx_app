import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Comparar acomodações
export async function compararAcomodacoes(ids: number[]) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/acomodacoes/comparar`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids }),
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao comparar acomodações:', error);
    return null;
  }
}

// Listar imagens de uma acomodação
export async function getAcomodacaoImagens(acomodacaoId: number) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/acomodacoes/${acomodacaoId}/imagens`;
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
    console.error('[AcomodacaoService] Erro ao buscar imagens:', error);
    return null;
  }
}

// Adicionar imagem à acomodação
export async function addAcomodacaoImagem(acomodacaoId: number, imagem: { uri: string; type: string; name: string }, descricao: string) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/acomodacoes/${acomodacaoId}/imagens`;
  const formData = new FormData();
  formData.append('imagem', imagem as any);
  formData.append('descricao', descricao);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) return null;
    return data;
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao adicionar imagem:', error);
    return null;
  }
}


// acomodacaoService.ts
export async function getAcomodacoes() {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/acomodacoes`;
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
    return data; // Expected: array of accommodations
  } catch (error) {
    console.error('[AcomodacaoService] Erro ao buscar acomodações:', error);
    return null;
  }
}