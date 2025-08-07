import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAcomodacoes } from '../../../../services/acomodacaoService';
import { getDestinos } from '../../../../services/destinoService';

interface Favorito {
  id: number;
  nome: string;
  preco?: string;
  rating?: number;
  tipo: 'acomodacao' | 'destino';
  descricao?: string;
}

const FavoritoCard = ({ favorito, onRemove }: { favorito: Favorito; onRemove: (id: number, tipo: string) => void }) => (
  <TouchableOpacity style={styles.card}>
    <Ionicons 
      name={favorito.tipo === 'acomodacao' ? 'bed' : 'location'} 
      size={32} 
      color={favorito.tipo === 'acomodacao' ? '#007AFF' : '#34C759'} 
      style={{ marginRight: 16 }} 
    />
    <View style={{ flex: 1 }}>
      <Text style={styles.cardTitle}>{favorito.nome}</Text>
      {favorito.descricao && (
        <Text style={styles.cardDesc} numberOfLines={2}>{favorito.descricao}</Text>
      )}
      <View style={styles.cardMeta}>
        {favorito.rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FF9500" />
            <Text style={styles.ratingText}>{favorito.rating}</Text>
          </View>
        )}
        {favorito.preco && (
          <Text style={styles.price}>R$ {favorito.preco}</Text>
        )}
        <Text style={styles.typeText}>
          {favorito.tipo === 'acomodacao' ? 'Acomodação' : 'Destino'}
        </Text>
      </View>
    </View>
    <TouchableOpacity 
      onPress={() => onRemove(favorito.id, favorito.tipo)}
      style={styles.removeButton}
    >
      <Ionicons name="heart" size={24} color="#FF3B30" />
    </TouchableOpacity>
  </TouchableOpacity>
);

export default function FavoritosTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [favoritos, setFavoritos] = useState<Favorito[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavoritos();
  }, []);

  const loadFavoritos = async () => {
    setLoading(true);
    try {
      // Carrega acomodações e destinos disponíveis
      const [acomodacoes, destinos] = await Promise.all([
        getAcomodacoes(),
        getDestinos()
      ]);

      const favoritosData: Favorito[] = [];

      // Simula alguns favoritos baseados nos dados reais
      // Em uma implementação real, você teria um endpoint específico para favoritos
      if (acomodacoes && acomodacoes.length > 0) {
        // Adiciona algumas acomodações como favoritos (simulação)
        acomodacoes.slice(0, 2).forEach((acomodacao: any) => {
          favoritosData.push({
            id: acomodacao.id,
            nome: acomodacao.nome || `Acomodação ${acomodacao.id}`,
            preco: acomodacao.preco?.toString() || '100,00',
            rating: acomodacao.rating || 4.5,
            tipo: 'acomodacao',
            descricao: acomodacao.descricao
          });
        });
      }

      if (destinos && destinos.length > 0) {
        // Adiciona alguns destinos como favoritos (simulação)
        destinos.slice(0, 2).forEach((destino: any) => {
          favoritosData.push({
            id: destino.id,
            nome: destino.nome || `Destino ${destino.id}`,
            rating: destino.rating || 4.8,
            tipo: 'destino',
            descricao: destino.descricao
          });
        });
      }

      // Se não há dados reais, usa dados de exemplo
      if (favoritosData.length === 0) {
        favoritosData.push(
          { id: 1, nome: 'Hotel São Paulo', preco: '120,00', rating: 4.8, tipo: 'acomodacao', descricao: 'Hotel no centro de São Paulo' },
          { id: 2, nome: 'Rio de Janeiro', rating: 4.9, tipo: 'destino', descricao: 'Cidade maravilhosa com praias incríveis' }
        );
      }

      setFavoritos(favoritosData);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      // Em caso de erro, carrega dados de exemplo
      setFavoritos([
        { id: 1, nome: 'Hotel São Paulo', preco: '120,00', rating: 4.8, tipo: 'acomodacao', descricao: 'Hotel no centro de São Paulo' },
        { id: 2, nome: 'Rio de Janeiro', rating: 4.9, tipo: 'destino', descricao: 'Cidade maravilhosa com praias incríveis' }
      ]);
    }
    setLoading(false);
  };

  const handleRemoveFavorito = (id: number, tipo: string) => {
    Alert.alert(
      'Remover Favorito',
      `Tem certeza que deseja remover este ${tipo === 'acomodacao' ? 'acomodação' : 'destino'} dos favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setFavoritos(prev => prev.filter(fav => !(fav.id === id && fav.tipo === tipo)));
            Alert.alert('Sucesso', 'Favorito removido com sucesso!');
          }
        }
      ]
    );
  };

  const handleRefresh = () => {
    loadFavoritos();
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Favoritos" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Meus Favoritos</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Carregando favoritos...</Text>
        ) : favoritos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#8E8E93" />
            <Text style={styles.emptyText}>Você ainda não possui favoritos</Text>
            <Text style={styles.emptySubText}>
              Explore acomodações e destinos para adicionar aos seus favoritos
            </Text>
          </View>
        ) : (
          favoritos.map(favorito => (
            <FavoritoCard 
              key={`${favorito.tipo}-${favorito.id}`} 
              favorito={favorito} 
              onRemove={handleRemoveFavorito}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  refreshButton: {
    padding: 8,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#8E8E93',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#34C759', marginLeft: 12 },
  typeText: { fontSize: 14, color: '#007AFF', marginLeft: 12 },
  removeButton: {
    padding: 8,
  },
});