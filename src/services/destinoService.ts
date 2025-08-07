import { API_BASE_URL } from './api';
import { storageService } from './storageService';

// Lista as imagens de um destino
export async function getDestinoImagens(destinoId: number) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/destinos/${destinoId}/imagens`;
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
    console.error('[DestinoService] Erro ao buscar imagens:', error);
    return null;
  }
}

// Adiciona uma imagem a um destino
export async function addDestinoImagem(destinoId: number, imagem: { uri: string; type: string; name: string }) {
  const token = await storageService.getAuthToken();
  if (!token) throw new Error('Usuário não autenticado');

  const url = `${API_BASE_URL}turista/destinos/${destinoId}/imagens`;
  const formData = new FormData();
  formData.append('imagem', imagem as any);

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
    console.error('[DestinoService] Erro ao adicionar imagem:', error);
    return null;
  }
}
