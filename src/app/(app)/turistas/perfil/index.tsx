import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../contexts/AuthContext';
import Header from '../../../../components/header/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilTurista() {
  const { logout, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState({
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '+55 (11) 99999-9999',
    bio: 'Turista apaixonada por viagens e novas experiências.'
  });

  const handleSave = () => {
    Alert.alert('Sucesso', 'Perfil atualizado!');
  };

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

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Meu Perfil" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Ionicons name="person" size={60} color="#8E8E93" />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={profile.name} onChangeText={t => setProfile({ ...profile, name: t })} />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={profile.email} onChangeText={t => setProfile({ ...profile, email: t })} />
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={profile.phone} onChangeText={t => setProfile({ ...profile, phone: t })} />
          <Text style={styles.label}>Biografia</Text>
          <TextInput style={[styles.input, styles.textArea]} value={profile.bio} onChangeText={t => setProfile({ ...profile, bio: t })} multiline numberOfLines={4} />
        </View>
      </ScrollView>
      <TouchableOpacity style={{backgroundColor:'#FF3B30',margin:20,padding:16,borderRadius:8,alignItems:'center'}} onPress={handleLogout}>
        <Text style={{color:'#FFF',fontWeight:'bold',fontSize:16}}>Sair</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  saveButton: { backgroundColor: '#007AFF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  photoSection: { alignItems: 'center', padding: 20, backgroundColor: '#FFF' },
  photoContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  changePhotoButton: { paddingVertical: 8 },
  changePhotoText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  section: { marginTop: 20, paddingHorizontal: 20 },
  label: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderRadius: 8, padding: 12, fontSize: 16, color: '#000', marginBottom: 16, borderWidth: 1, borderColor: '#E5E5EA' },
  textArea: { height: 80, textAlignVertical: 'top' },
});