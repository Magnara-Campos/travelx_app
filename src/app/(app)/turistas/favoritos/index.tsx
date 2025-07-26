import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const favoritos = [
  { id: 1, nome: 'São Paulo', preco: '120,00', rating: 4.8 },
  { id: 2, nome: 'Rio de Janeiro', preco: '150,00', rating: 4.9 },
];

const FavoritoCard = ({ favorito }: any) => (
  <TouchableOpacity style={styles.card}>
    <Ionicons name="heart" size={32} color="#FF3B30" style={{ marginRight: 16 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{favorito.nome}</Text>
      <View style={styles.cardMeta}>
        <Ionicons name="star" size={14} color="#FF9500" />
        <Text style={styles.ratingText}>{favorito.rating}</Text>
        <Text style={styles.price}>R$ {favorito.preco}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function FavoritosTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Favoritos" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Favoritos</Text>
        {favoritos.map(favorito => <FavoritoCard key={favorito.id} favorito={favorito} />)}
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
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#34C759', marginLeft: 12 },
});