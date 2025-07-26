// Configuração da API
import { API_BASE_URL } from './api';
// Importar storage service
import { storageService, StoredUserData } from './storageService';

// Tipos baseados na estrutura da API Laravel
export interface User {
  id: number;
  name: string;
  sobrenome: string;
  email: string;
  tipo_usuario: 'administrador' | 'guiaTurista' | 'turista';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  refresh_token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  sobrenome: string;
  email: string;
  password: string;
  tipo_usuario: 'administrador' | 'guiaTurista' | 'turista';
  documentos?: DocumentoData[];
  perfil_profissional?: PerfilProfissionalData;
}

export interface DocumentoData {
  tipo_documento: 'Passaporte' | 'Documento_Identidade' | 'Licenca_Guia';
  arquivo: any; // File object
}

export interface PerfilProfissionalData {
  nome: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

// Classe principal do AuthService
class AuthService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.initializeToken();
  }

  // Inicializar token do storage
  private async initializeToken() {
    try {
      const token = await storageService.getAuthToken();
      if (token) {
        this.token = token;
        console.log('✅ Token carregado do storage');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar token:', error);
    }
  }

  // Método para definir o token de autenticação
  async setToken(token: string) {
    this.token = token;
    await storageService.saveAuthToken(token);
  }

  // Método para remover o token
  async clearToken() {
    this.token = null;
    await storageService.removeAuthToken();
  }

  // Método genérico para fazer requisições
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      // Adiciona o token de autenticação se existir
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      const config: RequestInit = {
        ...options,
        headers,
      };

      console.log(`🌐 Auth API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📡 Auth API Response:`, data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
          details: data.details,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ Auth API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

    // Método para fazer upload de arquivos
  private async uploadRequest<T>(
    endpoint: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      const headers: Record<string, string> = {};

      // Adiciona o token de autenticação se existir
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }

      console.log(`🌐 Auth Upload Request: POST ${url}`);
      console.log('📤 FormData contents:', formData);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const text = await response.text();
      console.log('Status:', response.status);
      console.log('Response text:', text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: 'Resposta não é JSON', raw: text };
      }

      console.log(`📡 Auth Upload Response:`, data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
          details: data.details,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ Auth Upload Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>('v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.success && response.data) {
      // Salvar token e dados do usuário
      await this.setToken(response.data.access_token);
      await storageService.saveUserData(response.data.user);
      console.log('✅ Login realizado e dados salvos');
    }

    return response;
  }

  // Registro
  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    // Se há documentos para upload, usar FormData
    if (userData.documentos && userData.documentos.length > 0) {
      const formData = new FormData();

      // Adicionar dados básicos
      formData.append('name', userData.name);
      formData.append('sobrenome', userData.sobrenome);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('tipo_usuario', userData.tipo_usuario);

      // Adicionar documentos
      console.log('📋 Documentos para upload:', userData.documentos);
      userData.documentos.forEach((doc, index) => {
        console.log(`📄 Documento ${index}:`, doc);
        formData.append(`documentos[${index}][tipo_documento]`, doc.tipo_documento);
        formData.append(`documentos[${index}][arquivo]`, {
          uri: doc.arquivo.uri,
          type: doc.arquivo.type,
          name: doc.arquivo.name,
        } as any);
      });

      // Adicionar perfil profissional se for guia
      if (userData.perfil_profissional) {
        formData.append('perfil_profissional[nome]', userData.perfil_profissional.nome);
      }

      const response = await this.uploadRequest<AuthResponse>('v1/auth/register', formData);

      if (response.success && response.data) {
        // Salvar token e dados do usuário
        await this.setToken(response.data.access_token);
        await storageService.saveUserData(response.data.user);
        console.log('✅ Registro realizado e dados salvos');
      }

      return response;
    }

    // Se não há documentos, usar JSON
    const response = await this.request<AuthResponse>('v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data) {
      // Salvar token e dados do usuário
      await this.setToken(response.data.access_token);
      await storageService.saveUserData(response.data.user);
      console.log('✅ Registro realizado e dados salvos');
    }

    return response;
  }

  // Logout
  async logout(): Promise<ApiResponse> {
    const response = await this.request('v1/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      await this.clearToken();
      await storageService.clearAuthData();
      console.log('✅ Logout realizado e dados limpos');
    }

    return response;
  }

  // Obter perfil do usuário
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  // Atualizar perfil
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (response.success && response.data) {
      // Atualizar dados do usuário no storage
      await storageService.saveUserData(response.data);
      console.log('✅ Perfil atualizado e dados salvos');
    }

    return response;
  }

  // Mudar senha
  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<ApiResponse> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  // Verificar se o token é válido
  async validateToken(): Promise<ApiResponse<{ valid: boolean }>> {
    return this.request<{ valid: boolean }>('auth/auth/validate');
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = await storageService.getRefreshToken();

    if (!refreshToken) {
      return {
        success: false,
        error: 'Refresh token não encontrado',
      };
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.success && response.data) {
      // Atualizar tokens
      await this.setToken(response.data.access_token);
      if (response.data.refresh_token) {
        await storageService.saveRefreshToken(response.data.refresh_token);
      }
      console.log('✅ Token renovado');
    }

    return response;
  }

  // Verificar se está logado
  async isLoggedIn(): Promise<boolean> {
    return storageService.isLoggedIn();
  }

  // Obter dados da sessão
  async getSessionData() {
    return storageService.getSessionData();
  }

  // Limpar dados da sessão
  async clearSession() {
    await storageService.clearAuthData();
    this.token = null;
    console.log('✅ Sessão limpa');
  }
}

// Instância global do AuthService
export const authService = new AuthService(API_BASE_URL);

// Hooks úteis para usar com React
export const useAuth = () => {
  return {
    authService,
    setToken: (token: string) => authService.setToken(token),
    clearToken: () => authService.clearToken(),
    isLoggedIn: () => authService.isLoggedIn(),
    getSessionData: () => authService.getSessionData(),
    clearSession: () => authService.clearSession(),
  };
};

// Funções de conveniência
export const auth = {
  login: (credentials: LoginCredentials) => authService.login(credentials),
  register: (userData: RegisterData) => authService.register(userData),
  logout: () => authService.logout(),
  getProfile: () => authService.getProfile(),
  updateProfile: (profileData: Partial<User>) => authService.updateProfile(profileData),
  changePassword: (passwordData: any) => authService.changePassword(passwordData),
  validateToken: () => authService.validateToken(),
  refreshToken: () => authService.refreshToken(),
  isLoggedIn: () => authService.isLoggedIn(),
  getSessionData: () => authService.getSessionData(),
  clearSession: () => authService.clearSession(),
};

// Utilitários para validação
export const validateRegisterData = (data: RegisterData): string[] => {
  const errors: string[] = [];

  if (!data.name || data.name.length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (!data.sobrenome || data.sobrenome.length < 3) {
    errors.push('Sobrenome deve ter pelo menos 3 caracteres');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Email inválido');
  }

  if (!data.password || data.password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  if (!data.tipo_usuario || !['administrador', 'guiaTurista', 'turista'].includes(data.tipo_usuario)) {
    errors.push('Tipo de usuário inválido');
  }

  // Validações específicas por tipo de usuário
  if (data.tipo_usuario === 'turista') {
    if (!data.documentos || data.documentos.length === 0) {
      errors.push('Turista deve enviar pelo menos um documento');
    } else {
      const tipos = data.documentos.map(doc => doc.tipo_documento);
      if (!tipos.includes('Passaporte') && !tipos.includes('Documento_Identidade')) {
        errors.push('Turista deve enviar pelo menos Passaporte ou Documento de Identidade');
      }
    }
  }

  if (data.tipo_usuario === 'guiaTurista') {
    if (!data.documentos || data.documentos.length < 2) {
      errors.push('Guia Turista deve enviar pelo menos 2 documentos');
    } else {
      const tipos = data.documentos.map(doc => doc.tipo_documento);
      if (!tipos.includes('Documento_Identidade') || !tipos.includes('Licenca_Guia')) {
        errors.push('Guia Turista deve enviar Documento de Identidade e Licença de Guia');
      }
    }

    if (!data.perfil_profissional || !data.perfil_profissional.nome) {
      errors.push('Guia Turista deve informar o nome do perfil profissional');
    }
  }

  return errors;
};

// Constantes para tipos de usuário
export const USER_TYPES = {
  ADMINISTRADOR: 'administrador',
  GUIA_TURISTA: 'guiaTurista',
  TURISTA: 'turista',
} as const;

// Constantes para tipos de documento
export const DOCUMENT_TYPES = {
  PASSAPORTE: 'Passaporte',
  DOCUMENTO_IDENTIDADE: 'Documento_Identidade',
  LICENCA_GUIA: 'Licenca_Guia',
} as const;
