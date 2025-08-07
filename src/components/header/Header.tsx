import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, TouchableWithoutFeedback, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  nome: string;
  tipoUsuario: 'turista' | 'guiaTurista';
  avatarUrl?: string;
  onAvatarPress?: () => void;
  titulo?: string;
  open?: boolean; // se quiser controlar de fora
  onOpen?: () => void;
}

const cores = {
  turista: {
    fundo: '#4A90E2',
    texto: '#FFF',
    icone: 'airplane',
    gradiente: ['#4A90E2', '#50C9C3'],
  },
  guiaTurista: {
    fundo: '#34C759',
    texto: '#FFF',
    icone: 'map',
    gradiente: ['#34C759', '#6EE7B7'],
  },
};

const DRAWER_WIDTH = Dimensions.get('window').width * 0.75;

export default function Header({
  nome,
  tipoUsuario,
  avatarUrl,
  onAvatarPress,
  titulo,
  open,
  onOpen,
}: HeaderProps) {
  const tema = cores[tipoUsuario];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Permite abrir o Drawer de fora, se quiser
  React.useEffect(() => {
    if (open) openDrawer();
  }, [open]);

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
    if (onOpen) onOpen();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 250,
      useNativeDriver: false,
    }).start(() => setDrawerOpen(false));
  };

  // Funções de navegação do Drawer
  const goTo = (route: string) => {
    closeDrawer();
    setTimeout(() => {
      navigation.navigate(route as never);
    }, 250);
  };

  // Não renderiza header fixo
  return (
    <>
      {/* Drawer animado */}
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.drawerOverlay}>
            <Animated.View style={[styles.drawer, { left: drawerAnim }]}>
              <BlurView intensity={70} tint={tipoUsuario === 'turista' ? 'light' : 'default'} style={StyleSheet.absoluteFill} />
              <View style={[styles.drawerContent, { paddingTop: insets.top + 32 }]}>
                {/* Avatar e nome */}
                <View style={styles.avatarSection}>
                  <View style={[styles.avatarWrapper, { borderColor: tema.fundo }]}>
                    {avatarUrl ? (
                      <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                    ) : (
                      <Ionicons name="person-circle" size={70} color={tema.fundo} />
                    )}
                  </View>
                  <Text style={[styles.drawerNome, { color: tema.fundo }]}>{nome}</Text>
                </View>
                {/* Itens do menu */}
                <View style={styles.drawerItemList}>
                  <DrawerItem icon="home" label="Home" color="#4A90E2" onPress={() => goTo('Home')} gradiente={tema.gradiente} />
                  <DrawerItem icon="compass" label="Explorar" color="#50C9C3" onPress={() => goTo('Explorar')} gradiente={tema.gradiente} />
                  <DrawerItem icon="heart" label="Favoritos" color="#FF3B30" onPress={() => goTo('Favoritos')} gradiente={tema.gradiente} />
                  <DrawerItem icon="airplane" label="Viagens" color="#34C759" onPress={() => goTo('Viagens')} gradiente={tema.gradiente} />
                  <DrawerItem icon="person" label="Perfil" color="#8E8E93" onPress={() => goTo('Perfil')} gradiente={tema.gradiente} />
                  <View style={styles.separator} />
                  <DrawerItem icon="log-out" label="Sair" color="#FF3B30" onPress={() => goTo('Welcome')} gradiente={["#FF3B30", "#FFB199"]} />
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}
      {/* Botão flutuante para abrir o Drawer */}
      <TouchableOpacity style={styles.fab} onPress={openDrawer}>
        <Ionicons name="menu" size={32} color={tema.fundo} />
      </TouchableOpacity>
    </>
  );
}

interface DrawerItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress?: () => void;
  gradiente?: string[];
}

const DrawerItem = ({ icon, label, color = '#222', onPress, gradiente }: DrawerItemProps) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 18 }}>
      <TouchableOpacity
        style={[styles.drawerItemCard, Platform.OS === 'ios' && { shadowOpacity: 0.18 }]}
        onPress={onPress}
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.iconCircle, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={[styles.drawerItemText, { color }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    height: '100%',
    justifyContent: 'flex-start',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
  },
  drawerNome: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  drawerItemList: {
    marginTop: 10,
    width: '100%',
  },
  drawerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  drawerItemText: {
    fontSize: 17,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginVertical: 12,
    width: '100%',
    borderRadius: 2,
  },
  fab: {
    position: 'absolute',
    top: 32,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});