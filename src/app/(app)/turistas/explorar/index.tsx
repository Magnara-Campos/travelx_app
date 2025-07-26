import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const destinos = [
  { id: 1, nome: 'São Paulo', descricao: 'A maior cidade do Brasil', preco: '120,00', rating: 4.8 },
  { id: 2, nome: 'Rio de Janeiro', descricao: 'Cidade maravilhosa', preco: '150,00', rating: 4.9 },
  { id: 3, nome: 'Salvador', descricao: 'Cultura e praias', preco: '100,00', rating: 4.7 },
];

const DestinoCard = ({ destino }: any) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardImage}>
      <Ionicons name="image" size={40} color="#8E8E93" />
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle}>{destino.nome}</Text>
      <Text style={styles.cardDesc}>{destino.descricao}</Text>
      <View style={styles.cardMeta}>
        <View style={styles.rating}><Ionicons name="star" size={14} color="#FF9500" /><Text style={styles.ratingText}>{destino.rating}</Text></View>
        <Text style={styles.price}>R$ {destino.preco}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ExplorarTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Explorar" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Explorar Destinos</Text>
        {destinos.map(destino => <DestinoCard key={destino.id} destino={destino} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardImage: { width: 100, height: 100, backgroundColor: '#F2F2F7', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#34C759' },
});