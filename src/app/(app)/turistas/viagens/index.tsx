import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const viagens = [
  { id: 1, destino: 'São Paulo', data: '15/12/2024', status: 'confirmada' },
  { id: 2, destino: 'Rio de Janeiro', data: '20/01/2025', status: 'pendente' },
];

const ViagemCard = ({ viagem }: any) => (
  <TouchableOpacity style={styles.card}>
    <Ionicons name="airplane" size={32} color="#007AFF" style={{ marginRight: 16 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{viagem.destino}</Text>
      <Text style={styles.cardDesc}>Data: {viagem.data}</Text>
      <Text style={[styles.status, viagem.status === 'confirmada' ? styles.statusOk : styles.statusPending]}>{viagem.status}</Text>
    </View>
  </TouchableOpacity>
);

export default function ViagensTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Minhas Viagens" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Minhas Viagens</Text>
        {viagens.map(viagem => <ViagemCard key={viagem.id} viagem={viagem} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  status: { fontSize: 14, fontWeight: '600' },
  statusOk: { color: '#34C759' },
  statusPending: { color: '#FF9500' },
});