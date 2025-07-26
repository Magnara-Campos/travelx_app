import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';

// Chaves para o AsyncStorage
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  REFRESH_TOKEN: 'refresh_token',
  THEME: 'app_theme',
  LANGUAGE: 'app_language',
} as const;

// Interface para dados do usuário
export interface StoredUserData {
  id: number;
  name: string;
  sobrenome: string;
  email: string;
  tipo_usuario: 'administrador' | 'guiaTurista' | 'turista';
  created_at: string;
  updated_at: string;
}

// Classe principal do StorageService
class StorageService {
  // Salvar token de autenticação
  async saveAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      console.log('✅ Token salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar token:', error);
      throw error;
    }
  }

  // Obter token de autenticação
  async getAuthToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      console.error('❌ Erro ao obter token:', error);
      return null;
    }
  }

  // Remover token de autenticação
  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      console.log('✅ Token removido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover token:', error);
      throw error;
    }
  }

  // Salvar dados do usuário
  async saveUserData(userData: StoredUserData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      console.log('✅ Dados do usuário salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }

  // Obter dados do usuário
  async getUserData(): Promise<StoredUserData | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  // Remover dados do usuário
  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('✅ Dados do usuário removidos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover dados do usuário:', error);
      throw error;
    }
  }

  // Salvar refresh token
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
      console.log('✅ Refresh token salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar refresh token:', error);
      throw error;
    }
  }

  // Obter refresh token
  async getRefreshToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      return token;
    } catch (error) {
      console.error('❌ Erro ao obter refresh token:', error);
      return null;
    }
  }

  // Remover refresh token
  async removeRefreshToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      console.log('✅ Refresh token removido com sucesso');
    } catch (error) {
      console.error('❌ Erro ao remover refresh token:', error);
      throw error;
    }
  }

  // Salvar tema do app
  async saveTheme(theme: 'light' | 'dark' | 'auto'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
      console.log('✅ Tema salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar tema:', error);
      throw error;
    }
  }

  // Obter tema do app
  async getTheme(): Promise<'light' | 'dark' | 'auto' | null> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return theme as 'light' | 'dark' | 'auto' | null;
    } catch (error) {
      console.error('❌ Erro ao obter tema:', error);
      return null;
    }
  }

  // Salvar idioma do app
  async saveLanguage(language: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      console.log('✅ Idioma salvo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar idioma:', error);
      throw error;
    }
  }

  // Obter idioma do app
  async getLanguage(): Promise<string | null> {
    try {
      const language = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return language;
    } catch (error) {
      console.error('❌ Erro ao obter idioma:', error);
      return null;
    }
  }

  // Limpar todos os dados de autenticação
  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        this.removeAuthToken(),
        this.removeUserData(),
        this.removeRefreshToken(),
      ]);
      console.log('✅ Todos os dados de autenticação removidos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados de autenticação:', error);
      throw error;
    }
  }

  // Verificar se o usuário está logado
  async isLoggedIn(): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      const userData = await this.getUserData();
      return !!(token && userData);
    } catch (error) {
      console.error('❌ Erro ao verificar login:', error);
      return false;
    }
  }

  // Obter dados completos da sessão
  async getSessionData(): Promise<{
    token: string | null;
    userData: StoredUserData | null;
    refreshToken: string | null;
  }> {
    try {
      const [token, userData, refreshToken] = await Promise.all([
        this.getAuthToken(),
        this.getUserData(),
        this.getRefreshToken(),
      ]);

      return {
        token,
        userData,
        refreshToken,
      };
    } catch (error) {
      console.error('❌ Erro ao obter dados da sessão:', error);
      return {
        token: null,
        userData: null,
        refreshToken: null,
      };
    }
  }

  // Salvar dados completos da sessão
  async saveSessionData(data: {
    token: string;
    userData: StoredUserData;
    refreshToken?: string;
  }): Promise<void> {
    try {
      const promises: Promise<void>[] = [
        this.saveAuthToken(data.token),
        this.saveUserData(data.userData),
      ];

      if (data.refreshToken) {
        promises.push(this.saveRefreshToken(data.refreshToken));
      }

      await Promise.all(promises);
      console.log('✅ Dados da sessão salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar dados da sessão:', error);
      throw error;
    }
  }

  // Limpar todo o storage
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('✅ Todo o storage limpo com sucesso');
    } catch (error) {
      console.error('❌ Erro ao limpar storage:', error);
      throw error;
    }
  }
}

// Instância global do StorageService
export const storageService = new StorageService();

// Hooks úteis para usar com React
export const useStorage = () => {
  return {
    storageService,
    saveAuthToken: (token: string) => storageService.saveAuthToken(token),
    getAuthToken: () => storageService.getAuthToken(),
    removeAuthToken: () => storageService.removeAuthToken(),
    saveUserData: (userData: StoredUserData) => storageService.saveUserData(userData),
    getUserData: () => storageService.getUserData(),
    removeUserData: () => storageService.removeUserData(),
    isLoggedIn: () => storageService.isLoggedIn(),
    clearAuthData: () => storageService.clearAuthData(),
    saveSessionData: (data: any) => storageService.saveSessionData(data),
    getSessionData: () => storageService.getSessionData(),
  };
};

// Funções de conveniência
export const storage = {
  saveAuthToken: (token: string) => storageService.saveAuthToken(token),
  getAuthToken: () => storageService.getAuthToken(),
  removeAuthToken: () => storageService.removeAuthToken(),
  saveUserData: (userData: StoredUserData) => storageService.saveUserData(userData),
  getUserData: () => storageService.getUserData(),
  removeUserData: () => storageService.removeUserData(),
  isLoggedIn: () => storageService.isLoggedIn(),
  clearAuthData: () => storageService.clearAuthData(),
  saveSessionData: (data: any) => storageService.saveSessionData(data),
  getSessionData: () => storageService.getSessionData(),
  saveTheme: (theme: 'light' | 'dark' | 'auto') => storageService.saveTheme(theme),
  getTheme: () => storageService.getTheme(),
  saveLanguage: (language: string) => storageService.saveLanguage(language),
  getLanguage: () => storageService.getLanguage(),
  clearAll: () => storageService.clearAll(),
};