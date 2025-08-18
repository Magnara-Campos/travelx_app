import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compararRestaurantes, Restaurante } from '../../../../services/restauranteService';

interface DestinationCardProps {
  title: string;
  location: string;
  rating: number | string;
  price: number | string;
  onPress?: () => void;
  style?: object;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ title, location, rating, price, onPress, style }) => (
  <TouchableOpacity style={[styles.destinationCard, style]} onPress={onPress}>
    <View style={styles.destinationImage}>
      <Ionicons name="image" size={40} color="#8E8E93" />
    </View>
    <View style={styles.destinationInfo}>
      <Text style={styles.destinationTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.destinationLocation} numberOfLines={1}>{location}</Text>
      <View style={styles.destinationMeta}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FF9500" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
        <Text style={styles.priceText}>AOA {price}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function ExplorarTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [restaurantes, setRestaurantes] = useState<Restaurante[]>([]);
  const [loading, setLoading] = useState(false);
  const [maisBarato, setMaisBarato] = useState<Restaurante | null>(null);
  const [melhorAvaliado, setMelhorAvaliado] = useState<Restaurante | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurantes() {
      setLoading(true);
      setError(null);
      try {
        const res = await compararRestaurantes('Luanda', 'Internacional');
        if (res) {
          setRestaurantes(res.lista || []);
          setMaisBarato(res.mais_barato || null);
          setMelhorAvaliado(res.melhor_avaliado || null);
        } else {
          setError('Nenhum restaurante encontrado.');
        }
      } catch (err) {
        setError('Erro ao carregar restaurantes. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurantes();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
   
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* ---- Mais Barato + Melhor Avaliado na mesma linha ---- */}
        <Text style={styles.title}>Destaques</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#34C759" />
        ) : (
          <View style={styles.row}>
            {maisBarato ? (
              <DestinationCard
                title={maisBarato.nome}
                location={maisBarato.tipo_cozinha}
                rating={maisBarato.avaliacao_media}
                price={maisBarato.preco_medio_refeicao}
                style={{ width: '48%' }}
              />
            ) : (
              <Text style={styles.noDataText}>Sem barato</Text>
            )}
            {melhorAvaliado ? (
              <DestinationCard
                title={melhorAvaliado.nome}
                location={melhorAvaliado.tipo_cozinha}
                rating={melhorAvaliado.avaliacao_media}
                price={melhorAvaliado.preco_medio_refeicao}
                style={{ width: '48%' }}
              />
            ) : (
              <Text style={styles.noDataText}>Sem avaliado</Text>
            )}
          </View>
        )}

        {/* ---- Todos os Restaurantes (scroll horizontal, sem barra) ---- */}
        <Text style={styles.title}>Todos os Restaurantes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#34C759" />
        ) : restaurantes.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
          >
            {restaurantes.map(restaurante => (
              <DestinationCard
                key={`restaurante-${restaurante.id}`}
                title={restaurante.nome}
                location={restaurante.tipo_cozinha}
                rating={restaurante.avaliacao_media}
                price={restaurante.preco_medio_refeicao}
                style={{ width: 220, marginRight: 12 }}
              />
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>
            {error || 'Nenhum restaurante encontrado para esta busca.'}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 12, marginTop: 20 },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  horizontalScroll: { paddingRight: 20 },

  destinationCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  destinationImage: {
    height: 100,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: { padding: 12 },
  destinationTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  destinationLocation: { fontSize: 13, color: '#8E8E93', marginVertical: 4 },
  destinationMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 13, color: '#8E8E93', marginLeft: 4 },
  priceText: { fontSize: 14, fontWeight: '600', color: '#34C759' },
  noDataText: { fontSize: 14, color: '#8E8E93', textAlign: 'center', marginVertical: 20 },
});
