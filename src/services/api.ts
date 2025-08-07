// Configuração da API
export const API_BASE_URL = 'http://192.168.88.27:8000/api/';

// Tipos para as respostas da API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Classe principal da API
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Método para definir o token de autenticação
  setToken(token: string) {
    this.token = token;
  }

  // Método para remover o token
  clearToken() {
    this.token = null;
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

      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`📡 API Response:`, data);

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Métodos de autenticação
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    if (response.success) {
      this.clearToken();
    }

    return response;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  // Métodos para destinos/viagens
  async getDestinations(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/destinations');
  }

  async getDestination(id: number): Promise<ApiResponse<any>> {
    return this.request<any>(`/destinations/${id}`);
  }

  async searchDestinations(query: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/destinations/search?q=${encodeURIComponent(query)}`);
  }

  // Métodos para reservas
  async createBooking(bookingData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getUserBookings(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/user/bookings');
  }

  // Métodos para favoritos
  async addToFavorites(destinationId: number): Promise<ApiResponse> {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ destination_id: destinationId }),
    });
  }

  async removeFromFavorites(destinationId: number): Promise<ApiResponse> {
    return this.request(`/favorites/${destinationId}`, {
      method: 'DELETE',
    });
  }

  async getFavorites(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/favorites');
  }

  // Métodos para avaliações
  async createReview(reviewData: any): Promise<ApiResponse<any>> {
    return this.request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getDestinationReviews(destinationId: number): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/destinations/${destinationId}/reviews`);
  }

  // Métodos para upload de imagens
  async uploadImage(imageUri: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    } as any);

    return this.request<{ url: string }>('/upload/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
  }

  // Métodos para notificações
  async getNotifications(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/notifications');
  }

  async markNotificationAsRead(notificationId: number): Promise<ApiResponse> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Métodos para configurações do usuário
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

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
}

// Instância global da API
export const api = new ApiService(API_BASE_URL);

// Hooks úteis para usar com React
export const useApi = () => {
  return {
    api,
    setToken: (token: string) => api.setToken(token),
    clearToken: () => api.clearToken(),
  };
};

// Funções de conveniência para autenticação
export const authService = {
  login: (credentials: LoginCredentials) => api.login(credentials),
  register: (userData: RegisterData) => api.register(userData),
  logout: () => api.logout(),
  getProfile: () => api.getProfile(),
  updateProfile: (profileData: Partial<User>) => api.updateProfile(profileData),
  changePassword: (passwordData: any) => api.changePassword(passwordData),
};

// Funções de conveniência para destinos
export const destinationsService = {
  getAll: () => api.getDestinations(),
  getById: (id: number) => api.getDestination(id),
  search: (query: string) => api.searchDestinations(query),
};

// Funções de conveniência para reservas
export const bookingsService = {
  create: (bookingData: any) => api.createBooking(bookingData),
  getUserBookings: () => api.getUserBookings(),
};

// Funções de conveniência para favoritos
export const favoritesService = {
  add: (destinationId: number) => api.addToFavorites(destinationId),
  remove: (destinationId: number) => api.removeFromFavorites(destinationId),
  getAll: () => api.getFavorites(),
};

// Funções de conveniência para avaliações
export const reviewsService = {
  create: (reviewData: any) => api.createReview(reviewData),
  getDestinationReviews: (destinationId: number) => api.getDestinationReviews(destinationId),
};

// Funções de conveniência para notificações
export const notificationsService = {
  getAll: () => api.getNotifications(),
  markAsRead: (notificationId: number) => api.markNotificationAsRead(notificationId),
};

// Funções de conveniência para upload
export const uploadService = {
  image: (imageUri: string) => api.uploadImage(imageUri),
};
