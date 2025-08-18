import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import Header from '../../../../components/header/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilTurista() {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const nomeCompleto = `${user?.name || ''} ${user?.sobrenome || ''}`.trim();
  const dataNascimento = user?.data_nascimento
    ? new Date(user.data_nascimento).toLocaleDateString('pt-BR')
    : '-';

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={nomeCompleto || 'Turista'} tipoUsuario="turista" titulo="Meu Perfil" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
        </View>

        {/* Foto */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Ionicons name="person" size={60} color="#8E8E93" />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Dados do Usuário */}
        <View style={styles.section}>
          <Text style={styles.label}>Nome</Text>
          <Text style={styles.value}>{nomeCompleto || '-'}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || '-'}</Text>

          <Text style={styles.label}>Telefone</Text>
          <Text style={styles.value}>{user?.telefone || '-'}</Text>

          <Text style={styles.label}>Data de Nascimento</Text>
          <Text style={styles.value}>{dataNascimento}</Text>

          <Text style={styles.label}>Gênero</Text>
          <Text style={styles.value}>{user?.genero || '-'}</Text>

          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{user?.ativo ? 'Ativo' : 'Inativo'}</Text>
        </View>
      </ScrollView>

      {/* Botão Sair */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1 },
  header: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  photoSection: { alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  photoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  changePhotoButton: { paddingVertical: 8 },
  changePhotoText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  label: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  value: { fontSize: 16, color: '#000', marginBottom: 16 },
  logoutButton: { backgroundColor:'#FF3B30', margin:20, padding:16, borderRadius:8, alignItems:'center' },
  logoutText: { color:'#FFF', fontWeight:'bold', fontSize:16 }
});
