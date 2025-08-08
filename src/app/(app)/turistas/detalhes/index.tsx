import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image, TextInput, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getDestinoById, getDestinoImagens } from '../../../../services/destinoService';
import { getAcomodacaoById, getAcomodacaoImagens } from '../../../../services/acomodacaoService';
import { getAvaliacoes, criarAvaliacao, Avaliacao, CriarAvaliacaoData } from '../../../../services/avaliacaoService';
import { useRoute, useNavigation } from '@react-navigation/native';

interface RouteParams {
  id: number;
  tipo: 'destino' | 'acomodacao';
}

interface Imagem {
  url: string;
  descricao?: string;
}

interface AvaliacaoCardProps {
  avaliacao: Avaliacao;
}

const AvaliacaoCard: React.FC<AvaliacaoCardProps> = ({ avaliacao }) => {
  return (
    <View style={styles.avaliacaoCard}>
      <View style={styles.avaliacaoHeader}>
        <View style={styles.avaliacaoUser}>
          <Ionicons name="person-circle" size={24} color="#8E8E93" />
          <Text style={styles.avaliacaoUserName}>{avaliacao.turista?.name || 'Usuário'}</Text>
        </View>
        <View style={styles.avaliacaoRating}>
          <Ionicons name="star" size={16} color="#FF9500" />
          <Text style={styles.avaliacaoRatingText}>{avaliacao.nota}</Text>
        </View>
      </View>
      <Text style={styles.avaliacaoDate}>
        {new Date(avaliacao.created_at).toLocaleDateString('pt-BR')}
      </Text>
      <Text style={styles.avaliacaoComentario}>{avaliacao.comentario || 'Sem comentário'}</Text>
    </View>
  );
};

export default function DetalhesItem() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const { id, tipo } = route.params as RouteParams;

  const [item, setItem] = useState<any>(null);
  const [imagens, setImagens] = useState<Imagem[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    fetchItemDetails();
    fetchAvaliacoes();
  }, []);

  const fetchItemDetails = async () => {
    setLoading(true);
    try {
      let itemData;
      let imagensData;

      if (tipo === 'destino') {
        itemData = await getDestinoById(id);
        imagensData = await getDestinoImagens(id);
      } else {
        itemData = await getAcomodacaoById(id);
        imagensData = await getAcomodacaoImagens(id);
      }

      setItem(itemData);
      setImagens(imagensData || []);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os detalhes');
    }
    setLoading(false);
  };

  const fetchAvaliacoes = async () => {
    try {
      const allAvaliacoes = await getAvaliacoes();
      if (allAvaliacoes) {
        // Filtra avaliações pelo tipo e id do item
        const filteredAvaliacoes = allAvaliacoes.filter(avaliacao => {
          if (tipo === 'destino' && avaliacao.destino_id === id) return true;
          if (tipo === 'acomodacao' && avaliacao.acomodacao_id === id) return true;
          return false;
        });
        setAvaliacoes(filteredAvaliacoes);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  const handleEnviarAvaliacao = async () => {
    if (nota < 1 || nota > 5) {
      Alert.alert('Erro', 'A nota deve ser entre 1 e 5');
      return;
    }

    const avaliacaoData: CriarAvaliacaoData = {
      nota,
      comentario: comentario.trim() || undefined
    };

    // Adiciona o ID do item conforme o tipo
    if (tipo === 'destino') {
      avaliacaoData.destino_id = id;
    } else {
      avaliacaoData.acomodacao_id = id;
    }

    try {
      const novaAvaliacao = await criarAvaliacao(avaliacaoData);
      if (novaAvaliacao) {
        Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
        setModalVisible(false);
        setNota(5);
        setComentario('');
        // Atualiza a lista de avaliações
        fetchAvaliacoes();
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    }
  };

  const renderStars = (count: number) => {
    return Array(5).fill(0).map((_, i) => (
      <TouchableOpacity 
        key={i} 
        onPress={() => setNota(i + 1)}
        style={{ padding: 5 }}
      >
        <Ionicons 
          name={i < count ? "star" : "star-outline"} 
          size={30} 
          color={i < count ? "#FF9500" : "#8E8E93"} 
        />
      </TouchableOpacity>
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Detalhes" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Detalhes" />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Item não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Detalhes" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Imagem principal */}
        <View style={styles.imageContainer}>
          {imagens.length > 0 ? (
            <Image 
              source={{ uri: imagens[0].url }} 
              style={styles.mainImage} 
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons 
                name={tipo === 'destino' ? "location" : "bed"} 
                size={60} 
                color="#8E8E93" 
              />
            </View>
          )}
        </View>

        {/* Informações do item */}
        <View style={styles.infoContainer}>
          <Text style={styles.itemTitle}>{item.nome}</Text>
          
          <View style={styles.itemMeta}>
            {tipo === 'destino' && item.cidade && (
              <View style={styles.metaItem}>
                <Ionicons name="location" size={16} color="#8E8E93" />
                <Text style={styles.metaText}>{item.cidade}</Text>
              </View>
            )}
            
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color="#FF9500" />
              <Text style={styles.metaText}>{item.rating || 0}</Text>
            </View>
            
            {tipo === 'acomodacao' && item.preco && (
              <View style={styles.metaItem}>
                <Ionicons name="cash" size={16} color="#34C759" />
                <Text style={styles.metaText}>R$ {item.preco}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.itemDescription}>{item.descricao}</Text>
        </View>

        {/* Seção de avaliações */}
        <View style={styles.avaliacoesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Avaliações</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Avaliar</Text>
            </TouchableOpacity>
          </View>
          
          {avaliacoes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma avaliação disponível</Text>
          ) : (
            avaliacoes.map((avaliacao) => (
              <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal para adicionar avaliação */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Avaliar {tipo === 'destino' ? 'Destino' : 'Acomodação'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.ratingLabel}>Sua nota:</Text>
              <View style={styles.starsContainer}>
                {renderStars(nota)}
              </View>
              
              <Text style={styles.commentLabel}>Comentário (opcional):</Text>
              <TextInput
                style={styles.commentInput}
                value={comentario}
                onChangeText={setComentario}
                placeholder="Compartilhe sua experiência..."
                multiline={true}
                numberOfLines={4}
                maxLength={500}
              />
              
              <TouchableOpacity 
                style={styles.submitButton}
                onPress={handleEnviarAvaliacao}
              >
                <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F2F2F7' 
  },
  scrollView: { 
    flex: 1 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 18,
    color: '#8E8E93'
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30'
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E5EA'
  },
  mainImage: {
    width: '100%',
    height: '100%'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E5EA'
  },
  infoContainer: {
    padding: 20
  },
  itemTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10
  },
  itemMeta: {
    flexDirection: 'row',
    marginBottom: 15
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4
  },
  itemDescription: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24
  },
  avaliacoesSection: {
    padding: 20,
    paddingTop: 0
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 20,
    marginBottom: 20
  },
  avaliacaoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  avaliacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  avaliacaoUser: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avaliacaoUserName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  avaliacaoRating: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avaliacaoRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#FF9500'
  },
  avaliacaoDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8
  },
  avaliacaoComentario: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  modalContent: {
    padding: 20
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  commentInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20
  },
  submitButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center'
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16
  }
});