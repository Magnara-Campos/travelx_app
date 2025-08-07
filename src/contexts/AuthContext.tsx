import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { storageService } from '../services/storageService';

// Interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  checkAuthStatus: () => Promise<void>;
}

// Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props para o provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider do contexto de autenticação
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar status de autenticação ao inicializar
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Verificar se o usuário está autenticado
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);

      const isLoggedIn = await authService.isLoggedIn();

      if (isLoggedIn) {
        const sessionData = await authService.getSessionData();
        if (sessionData.userData) {
          setUser(sessionData.userData);
          setIsAuthenticated(true);
          console.log('✅ Usuário autenticado:', sessionData.userData);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        console.log('❌ Usuário não autenticado');
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status de autenticação:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ Login realizado com sucesso');
        return true;
      } else {
        console.error('❌ Falha no login:', response.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      return false;
    }
  };

  // Função de registro
  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await authService.register(userData);

      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('✅ Registro realizado com sucesso');
        return true;
      } else {
        console.error('❌ Falha no registro:', response.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      return false;
    }
  };

  // Função de logout
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, limpar o estado local
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Função para atualizar dados do usuário
  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // Valor do contexto
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Hook para verificar se está carregando
export const useAuthLoading = (): boolean => {
  const { isLoading } = useAuth();
  return isLoading;
};

// Hook para verificar se está autenticado
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

// Hook para obter dados do usuário
export const useUser = (): User | null => {
  const { user } = useAuth();
  return user;
};