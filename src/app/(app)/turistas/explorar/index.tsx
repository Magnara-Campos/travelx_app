import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { compararRestaurantes, Restaurante, CompararRestaurantesResponse } from '../../../../services/restauranteService';

const destinos = [
  { id: 1, nome: 'São Paulo', descricao: 'A maior cidade do Brasil', preco: '120,00', rating: 4.8 },
  { id: 2, nome: 'Rio de Janeiro', descricao: 'Cidade maravilhosa', preco: '150,00', rating: 4.9 },
  { id: 3, nome: 'Salvador', descricao: 'Cultura e praias', preco: '100,00', rating: 4.7 },
];

interface Destino {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  rating: number;
}

const DestinoCard = ({ destino }: { destino: Destino | Restaurante }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardImage}>
      {'imagem' in destino && destino.imagem ? (
        <Text style={styles.cardImageText}>Imagem do Restaurante</Text> // Substituir por componente de imagem real se disponível
      ) : (
        <Ionicons name="image" size={40} color="#8E8E93" />
      )}
    </View>
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle}>{destino.nome}</Text>
      <Text style={styles.cardDesc}>
        {'tipo_cozinha' in destino ? destino.tipo_cozinha : destino.descricao}
      </Text>
      <View style={styles.cardMeta}>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#FF9500" />
          <Text style={styles.ratingText}>
            {'avaliacao_media' in destino ? destino.avaliacao_media : destino.rating}
          </Text>
        </View>
        <Text style={styles.price}>
          AOA {'preco_medio_refeicao' in destino ? destino.preco_medio_refeicao : destino.preco}
        </Text>
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
          console.log('Restaurantes da API:', res.lista);
        } else {
          setError('Nenhum restaurante encontrado.');
          setRestaurantes([]);
          setMaisBarato(null);
          setMelhorAvaliado(null);
        }
      } catch (err) {
        setError('Erro ao carregar restaurantes. Tente novamente mais tarde.');
        console.log('[ExplorarTurista] Erro:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurantes();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Explorar" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Explorar Destinos</Text>
        {destinos.map(destino => (
          <DestinoCard key={`destino-${destino.id}`} destino={destino} />
        ))}

        <Text style={styles.title}>Restaurante Mais Barato</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#34C759" />
        ) : maisBarato ? (
          <DestinoCard destino={maisBarato} />
        ) : (
          <Text style={styles.noDataText}>
            {error || 'Nenhum restaurante mais barato encontrado.'}
          </Text>
        )}

        <Text style={styles.title}>Restaurante Melhor Avaliado</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#34C759" />
        ) : melhorAvaliado ? (
          <DestinoCard destino={melhorAvaliado} />
        ) : (
          <Text style={styles.noDataText}>
            {error || 'Nenhum restaurante melhor avaliado encontrado.'}
          </Text>
        )}

        <Text style={styles.title}>Todos os Restaurantes</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#34C759" />
        ) : restaurantes.length > 0 ? (
          restaurantes.map(restaurante => (
            <DestinoCard key={`restaurante-${restaurante.id}`} destino={restaurante} />
          ))
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 20, marginTop: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImage: {
    width: 100,
    height: 100,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImageText: { fontSize: 14, color: '#8E8E93', textAlign: 'center' },
  cardInfo: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#34C759' },
  noDataText: { fontSize: 16, color: '#8E8E93', textAlign: 'center', marginVertical: 20 },
});