import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';

export default function WelcomeScreen({ navigation }: any) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0A1A24' : '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    image: {
      width: 220,
      height: 220,
      marginBottom: 32,
    },
    title: {
      color: isDark ? '#fff' : '#1A1A1A',
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      color: isDark ? '#B0C4D4' : '#6B7280',
      fontSize: 15,
      textAlign: 'center',
      marginBottom: 40,
    },
    createAccountButton: {
      backgroundColor: '#4A90E2',
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 60,
      marginBottom: 16,
      shadowColor: '#4A90E2',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    createAccountText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    loginButton: {
      borderColor: '#4A90E2',
      borderWidth: 2,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 60,
      backgroundColor: isDark ? 'transparent' : '#F8FAFC',
    },
    loginText: {
      color: '#4A90E2',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Image source={require('../assets/Boas-vindas0.png')} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>Escape the ordinary life</Text>
      <Text style={styles.subtitle}>
        Discover great experiences around you{"\n"}and make you live interesting!
      </Text>
      <TouchableOpacity style={styles.createAccountButton} onPress={() => navigation?.navigate('SignUp')}>
        <Text style={styles.createAccountText}>Criar Conta</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={() => navigation?.navigate('Login')}>
        <Text style={styles.loginText}>Iniciar Sessão</Text>
      </TouchableOpacity>
    </View>
  );
}