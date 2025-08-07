import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAcomodacoes, getAcomodacaoImagens, compararAcomodacoes } from '../../../../services/acomodacaoService';
import { getDestinos, getDestinoImagens } from '../../../../services/destinoService';

interface Acomodacao {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  rating: number;
  tipo: 'acomodacao';
}

interface Destino {
  id: number;
  nome: string;
  descricao: string;
  cidade?: string;
  rating: number;
  tipo: 'destino';
}

type ExploreItem = Acomodacao | Destino;

interface Imagem {
  url: string;
  descricao?: string;
}

const ExploreCard = ({ item, onSelect, isSelected }: { item: ExploreItem; onSelect: (id: number, tipo: string) => void; isSelected: boolean }) => {
  const [imagem, setImagem] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImagem() {
      try {
        if (item.tipo === 'acomodacao') {
          const imagens = await getAcomodacaoImagens(item.id);
          if (imagens && imagens.length > 0) {
            setImagem(imagens[0].url);
          }
        } else if (item.tipo === 'destino') {
          const imagens = await getDestinoImagens(item.id);
          if (imagens && imagens.length > 0) {
            setImagem(imagens[0].url);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
      }
    }
    fetchImagem();
  }, [item.id, item.tipo]);

  const getIcon = () => {
    return item.tipo === 'acomodacao' ? 'bed' : 'location';
  };

  const getIconColor = () => {
    return item.tipo === 'acomodacao' ? '#007AFF' : '#34C759';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect(item.id, item.tipo)}>
      <View style={styles.cardImage}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={{ width: 100, height: 100, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }} />
        ) : (
          <Ionicons name={getIcon()} size={40} color={getIconColor()} />
        )}
        <TouchableOpacity style={styles.checkbox} onPress={() => onSelect(item.id, item.tipo)}>
          <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? '#34C759' : '#8E8E93'} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <Text style={styles.cardDesc}>{item.descricao}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FF9500" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          {'preco' in item && <Text style={styles.price}>R$ {item.preco}</Text>}
          {'cidade' in item && item.cidade && <Text style={styles.location}>{item.cidade}</Text>}
          <Text style={styles.typeTag}>
            {item.tipo === 'acomodacao' ? 'Acomodação' : 'Destino'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ExplorarTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{id: number, tipo: string}[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'acomodacao' | 'destino'>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [acomodacoes, destinos] = await Promise.all([
        getAcomodacoes(),
        getDestinos()
      ]);

      const allItems: ExploreItem[] = [];

      if (acomodacoes && acomodacoes.length > 0) {
        acomodacoes.forEach((acomodacao: any) => {
          allItems.push({
            id: acomodacao.id,
            nome: acomodacao.nome || `Acomodação ${acomodacao.id}`,
            descricao: acomodacao.descricao || 'Descrição não disponível',
            preco: acomodacao.preco?.toString() || '100.00',
            rating: acomodacao.rating || 4.5,
            tipo: 'acomodacao'
          });
        });
      }

      if (destinos && destinos.length > 0) {
        destinos.forEach((destino: any) => {
          allItems.push({
            id: destino.id,
            nome: destino.nome || `Destino ${destino.id}`,
            descricao: destino.descricao || 'Descrição não disponível',
            cidade: destino.cidade || 'Brasil',
            rating: destino.rating || 4.8,
            tipo: 'destino'
          });
        });
      }

      // Se não há dados reais, adiciona dados de exemplo
      if (allItems.length === 0) {
        allItems.push(
          {
            id: 1,
            nome: 'Hotel São Paulo',
            descricao: 'Hotel confortável no centro da cidade',
            preco: '120.00',
            rating: 4.5,
            tipo: 'acomodacao'
          },
          {
            id: 2,
            nome: 'Rio de Janeiro',
            descricao: 'Cidade maravilhosa com praias incríveis',
            cidade: 'Rio de Janeiro',
            rating: 4.9,
            tipo: 'destino'
          }
        );
      }

      setItems(allItems);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    }
    setLoading(false);
  };

  const handleSelect = (id: number, tipo: string) => {
    setSelectedItems((prev) => {
      const exists = prev.find(item => item.id === id && item.tipo === tipo);
      if (exists) {
        return prev.filter(item => !(item.id === id && item.tipo === tipo));
      } else {
        return [...prev, { id, tipo }];
      }
    });
  };

  const handleCompare = async () => {
    const acomodacaoIds = selectedItems.filter(item => item.tipo === 'acomodacao').map(item => item.id);
    
    if (acomodacaoIds.length < 2) {
      Alert.alert('Aviso', 'Selecione pelo menos duas acomodações para comparar. Comparação de destinos não está disponível ainda.');
      return;
    }

    try {
      const data = await compararAcomodacoes(acomodacaoIds);
      if (data) {
        setComparisonData(data);
        setModalVisible(true);
      } else {
        Alert.alert('Erro', 'Erro ao comparar acomodações.');
      }
    } catch (error) {
      console.error('Erro ao comparar:', error);
      Alert.alert('Erro', 'Erro interno ao comparar acomodações.');
    }
  };

  const getFilteredItems = () => {
    if (filterType === 'all') return items;
    return items.filter(item => item.tipo === filterType);
  };

  const isSelected = (id: number, tipo: string) => {
    return selectedItems.some(item => item.id === id && item.tipo === tipo);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Explorar" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Explorar</Text>
          {selectedItems.length >= 2 && (
            <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
              <Text style={styles.compareButtonText}>Comparar ({selectedItems.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'acomodacao' && styles.filterButtonActive]}
            onPress={() => setFilterType('acomodacao')}
          >
            <Text style={[styles.filterText, filterType === 'acomodacao' && styles.filterTextActive]}>Acomodações</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filterType === 'destino' && styles.filterButtonActive]}
            onPress={() => setFilterType('destino')}
          >
            <Text style={[styles.filterText, filterType === 'destino' && styles.filterTextActive]}>Destinos</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Carregando...</Text>
        ) : getFilteredItems().length === 0 ? (
          <Text style={styles.emptyText}>Nenhum item encontrado</Text>
        ) : (
          getFilteredItems().map((item) => (
            <ExploreCard
              key={`${item.tipo}-${item.id}`}
              item={item}
              onSelect={handleSelect}
              isSelected={isSelected(item.id, item.tipo)}
            />
          ))
        )}
      </ScrollView>

      {/* Modal for Comparison */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comparação de Acomodações</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {comparisonData && (
              <View>
                {comparisonData.map((item: any, index: number) => (
                  <View key={index} style={styles.comparisonItem}>
                    <Text style={styles.comparisonTitle}>{item.nome}</Text>
                    <Text>Preço: R$ {item.preco}</Text>
                    <Text>Rating: {item.rating}</Text>
                    <Text>Descrição: {item.descricao}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  compareButton: { backgroundColor: '#34C759', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  compareButtonText: { color: '#FFF', fontWeight: '600' },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardImage: { width: 100, height: 100, backgroundColor: '#F2F2F7', borderTopLeftRadius: 12, borderBottomLeftRadius: 12, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  checkbox: { position: 'absolute', top: 8, right: 8 },
  cardInfo: { flex: 1, padding: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  cardMeta: { flexDirection: 'column', alignItems: 'flex-start' },
  rating: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#34C759', marginBottom: 4 },
  location: { fontSize: 14, color: '#8E8E93', marginBottom: 4 },
  typeTag: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    fontSize: 12,
    color: '#666',
  },
  modalContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  modalContent: { padding: 20 },
  comparisonItem: { marginBottom: 20, padding: 16, backgroundColor: '#FFF', borderRadius: 12 },
  comparisonTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  filterContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20, backgroundColor: '#FFF', borderRadius: 12, padding: 8 },
  filterButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  filterButtonActive: { backgroundColor: '#34C759' },
  filterText: { fontSize: 16, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#FFF' },
  loadingText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#8E8E93' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#8E8E93' },
});