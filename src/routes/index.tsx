import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import WelcomeScreen from '../app/index';
import LoginScreen from '../app/(auth)/login';
import RegisterScreen from '../app/(auth)/register';
import { useAuth } from '../contexts/AuthContext';

// Importar telas de guia
import HomeGuia from '../app/(app)/guias/home';
import PerfilGuia from '../app/(app)/guias/perfil';
import PasseiosGuia from '../app/(app)/guias/passeios';
import ReservasGuia from '../app/(app)/guias/reservas';
import NotificacoesGuia from '../app/(app)/guias/notificacoes';
import HomeTurista from '../app/(app)/turistas/home';
import ExplorarTurista from '../app/(app)/turistas/explorar';
import FavoritosTurista from '../app/(app)/turistas/favoritos';
import ViagensTurista from '../app/(app)/turistas/viagens';
import PerfilTurista from '../app/(app)/turistas/perfil';

function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ color: '#1A1A1A', fontSize: 22 }}>Tela Principal</Text>
    </View>
  );
}

function DestinationsScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ color: '#1A1A1A', fontSize: 22 }}>Destinos</Text>
    </View>
  );
}

function ExploreScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ color: '#1A1A1A', fontSize: 22 }}>Explorar</Text>
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ color: '#1A1A1A', fontSize: 22 }}>Perfil</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// TabNavigator para usuários comuns (turistas)
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Explorar') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Favoritos') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Viagens') {
            iconName = focused ? 'airplane' : 'airplane-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeTurista} />
      <Tab.Screen name="Explorar" component={ExplorarTurista} />
      <Tab.Screen name="Favoritos" component={FavoritosTurista} />
      <Tab.Screen name="Viagens" component={ViagensTurista} />
      <Tab.Screen name="Perfil" component={PerfilTurista} />
    </Tab.Navigator>
  );
}

// TabNavigator específico para guias
function GuiaTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Passeios') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Reservas') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Notificações') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5EA',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1A1A1A',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeGuia}
        options={{ title: 'Início' }}
      />
      <Tab.Screen
        name="Passeios"
        component={PasseiosGuia}
        options={{ title: 'Meus Passeios' }}
      />
      <Tab.Screen
        name="Reservas"
        component={ReservasGuia}
        options={{ title: 'Reservas' }}
      />
      <Tab.Screen
        name="Notificações"
        component={NotificacoesGuia}
        options={{ title: 'Notificações' }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilGuia}
        options={{ title: 'Meu Perfil' }}
      />
    </Tab.Navigator>
  );
}

// Componente principal de rotas
function AppNavigator() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Se está carregando, mostrar tela de loading
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <Text style={{ color: '#1A1A1A', fontSize: 18 }}>Carregando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Rotas para usuários não autenticados
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        // Rotas para usuários autenticados
        <>
          {user?.tipo_usuario === 'guiaTurista' ? (
            // Navegação específica para guias
            <Stack.Screen name="GuiaMain" component={GuiaTabNavigator} />
          ) : (
            // Navegação para outros tipos de usuário (turistas, administradores)
            <Stack.Screen name="Main" component={TabNavigator} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function Routes() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
