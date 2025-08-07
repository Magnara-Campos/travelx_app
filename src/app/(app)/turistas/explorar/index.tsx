import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAcomodacoes, getAcomodacaoImagens, compararAcomodacoes } from '../../../../services/acomodacaoService';

interface Acomodacao {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  rating: number;
}

interface Imagem {
  url: string;
  descricao?: string;
}

const AcomodacaoCard = ({ acomodacao, onSelect, isSelected }: { acomodacao: Acomodacao; onSelect: (id: number) => void; isSelected: boolean }) => {
  const [imagem, setImagem] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImagem() {
      const imagens = await getAcomodacaoImagens(acomodacao.id);
      if (imagens && imagens.length > 0) {
        setImagem(imagens[0].url); // Use the first image
      }
    }
    fetchImagem();
  }, [acomodacao.id]);

  return (
    <TouchableOpacity style={styles.card} onPress={() => onSelect(acomodacao.id)}>
      <View style={styles.cardImage}>
        {imagem ? (
          <Image source={{ uri: imagem }} style={{ width: 100, height: 100, borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }} />
        ) : (
          <Ionicons name="image" size={40} color="#8E8E93" />
        )}
        <TouchableOpacity style={styles.checkbox} onPress={() => onSelect(acomodacao.id)}>
          <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={24} color={isSelected ? '#34C759' : '#8E8E93'} />
        </TouchableOpacity>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{acomodacao.nome}</Text>
        <Text style={styles.cardDesc}>{acomodacao.descricao}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#FF9500" />
            <Text style={styles.ratingText}>{acomodacao.rating}</Text>
          </View>
          <Text style={styles.price}>R$ {acomodacao.preco}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function ExplorarTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function fetchAcomodacoes() {
      const data = await getAcomodacoes();
      if (data) {
        setAcomodacoes(data);
      }
    }
    fetchAcomodacoes();
  }, []);

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      alert('Selecione pelo menos duas acomodações para comparar.');
      return;
    }
    const data = await compararAcomodacoes(selectedIds);
    if (data) {
      setComparisonData(data);
      setModalVisible(true);
    } else {
      alert('Erro ao comparar acomodações.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Explorar Acomodações" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Explorar Acomodações</Text>
          {selectedIds.length >= 2 && (
            <TouchableOpacity style={styles.compareButton} onPress={handleCompare}>
              <Text style={styles.compareButtonText}>Comparar ({selectedIds.length})</Text>
            </TouchableOpacity>
          )}
        </View>
        {acomodacoes.map((acomodacao) => (
          <AcomodacaoCard
            key={acomodacao.id}
            acomodacao={acomodacao}
            onSelect={handleSelect}
            isSelected={selectedIds.includes(acomodacao.id)}
          />
        ))}
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
                    {/* Add more fields as per comparison data */}
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
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
  price: { fontSize: 14, fontWeight: '600', color: '#34C759' },
  modalContainer: { flex: 1, backgroundColor: '#F2F2F7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  modalContent: { padding: 20 },
  comparisonItem: { marginBottom: 20, padding: 16, backgroundColor: '#FFF', borderRadius: 12 },
  comparisonTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});