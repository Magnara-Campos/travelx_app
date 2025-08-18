// userProfileService.js

import { API_BASE_URL } from './api';
import { storageService } from './storageService';

interface ProfileData {
  name: string;
  sobrenome: string;
  telefone: string;
  data_nascimento: string; // Formato: 'YYYY-MM-DD'
  genero: string;
}

export const userProfileService = {
  // Obter perfil do usuário
  async getProfile() {
    try {
      const token = storageService.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}turista/perfil`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao obter perfil do usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no userProfileService.getProfile:', error);
      throw error;
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(profileData: ProfileData) {
    try {
      const token = storageService.getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch(`${API_BASE_URL}turista/perfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          sobrenome: profileData.sobrenome,
          telefone: profileData.telefone,
          data_nascimento: profileData.data_nascimento,
          genero: profileData.genero,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil do usuário');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no userProfileService.updateProfile:', error);
      throw error;
    }
  },
};