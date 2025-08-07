import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getReservas, criarReserva, getReservaById, atualizarReserva, deletarReserva } from '../../../../services/reservasService';

interface Reserva {
  id: number;
  data_inicio: string;
  data_fim: string;
  quantidade_pessoas: number;
  valor_total: number;
  status?: string;
  acomodacao_id?: number;
  atividade_id?: number;
  acomodacao?: { nome: string };
  atividade?: { nome: string };
}

const ViagemCard = ({ reserva, onEdit, onDelete }: { reserva: Reserva; onEdit: (reserva: Reserva) => void; onDelete: (id: number) => void }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmada': return '#34C759';
      case 'pendente': return '#FF9500';
      case 'cancelada': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  return (
    <TouchableOpacity style={styles.card}>
      <Ionicons name="airplane" size={32} color="#007AFF" style={{ marginRight: 16 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>
          {reserva.acomodacao?.nome || reserva.atividade?.nome || 'Reserva'}
        </Text>
        <Text style={styles.cardDesc}>
          {formatDate(reserva.data_inicio)} - {formatDate(reserva.data_fim)}
        </Text>
        <Text style={styles.cardDesc}>
          {reserva.quantidade_pessoas} pessoa(s) - R$ {reserva.valor_total}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(reserva.status) }]}>
          {reserva.status || 'Pendente'}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity onPress={() => onEdit(reserva)} style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(reserva.id)} style={styles.deleteButton}>
          <Ionicons name="trash" size={16} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function ViagensTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReserva, setEditingReserva] = useState<Reserva | null>(null);
  const [formData, setFormData] = useState({
    data_inicio: '',
    data_fim: '',
    quantidade_pessoas: '1',
    valor_total: '',
    acomodacao_id: '',
    atividade_id: ''
  });

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    setLoading(true);
    try {
      const data = await getReservas();
      if (data) {
        setReservas(data);
      }
    } catch (error) {
      console.error('Erro ao carregar reservas:', error);
      Alert.alert('Erro', 'Não foi possível carregar suas reservas');
    }
    setLoading(false);
  };

  const handleCreateReserva = async () => {
    try {
      const reservaData = {
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        quantidade_pessoas: parseInt(formData.quantidade_pessoas),
        valor_total: parseFloat(formData.valor_total),
        ...(formData.acomodacao_id && { acomodacao_id: parseInt(formData.acomodacao_id) }),
        ...(formData.atividade_id && { atividade_id: parseInt(formData.atividade_id) })
      };

      const result = await criarReserva(reservaData);
      if (result) {
        Alert.alert('Sucesso', 'Reserva criada com sucesso!');
        setModalVisible(false);
        resetForm();
        loadReservas();
      } else {
        Alert.alert('Erro', 'Não foi possível criar a reserva');
      }
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      Alert.alert('Erro', 'Erro interno ao criar reserva');
    }
  };

  const handleEditReserva = (reserva: Reserva) => {
    setEditingReserva(reserva);
    setFormData({
      data_inicio: reserva.data_inicio.split('T')[0],
      data_fim: reserva.data_fim.split('T')[0],
      quantidade_pessoas: reserva.quantidade_pessoas.toString(),
      valor_total: reserva.valor_total.toString(),
      acomodacao_id: reserva.acomodacao_id?.toString() || '',
      atividade_id: reserva.atividade_id?.toString() || ''
    });
    setModalVisible(true);
  };

  const handleUpdateReserva = async () => {
    if (!editingReserva) return;

    try {
      const updateData = {
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        quantidade_pessoas: parseInt(formData.quantidade_pessoas)
      };

      const result = await atualizarReserva(editingReserva.id, updateData);
      if (result) {
        Alert.alert('Sucesso', 'Reserva atualizada com sucesso!');
        setModalVisible(false);
        resetForm();
        loadReservas();
      } else {
        Alert.alert('Erro', 'Não foi possível atualizar a reserva');
      }
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      Alert.alert('Erro', 'Erro interno ao atualizar reserva');
    }
  };

  const handleDeleteReserva = (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta reserva?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const success = await deletarReserva(id);
            if (success) {
              Alert.alert('Sucesso', 'Reserva excluída com sucesso!');
              loadReservas();
            } else {
              Alert.alert('Erro', 'Não foi possível excluir a reserva');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      data_inicio: '',
      data_fim: '',
      quantidade_pessoas: '1',
      valor_total: '',
      acomodacao_id: '',
      atividade_id: ''
    });
    setEditingReserva(null);
  };

  const openNewReservaModal = () => {
    resetForm();
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Minhas Viagens" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Minhas Viagens</Text>
          <TouchableOpacity style={styles.addButton} onPress={openNewReservaModal}>
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addButtonText}>Nova Reserva</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <Text style={styles.loadingText}>Carregando reservas...</Text>
        ) : reservas.length === 0 ? (
          <Text style={styles.emptyText}>Você ainda não possui reservas</Text>
        ) : (
          reservas.map(reserva => (
            <ViagemCard 
              key={reserva.id} 
              reserva={reserva} 
              onEdit={handleEditReserva}
              onDelete={handleDeleteReserva}
            />
          ))
        )}
      </ScrollView>

      {/* Modal para criar/editar reserva */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingReserva ? 'Editar Reserva' : 'Nova Reserva'}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Data de Início</Text>
            <TextInput
              style={styles.input}
              value={formData.data_inicio}
              onChangeText={(text) => setFormData({...formData, data_inicio: text})}
              placeholder="YYYY-MM-DD"
            />
            
            <Text style={styles.label}>Data de Fim</Text>
            <TextInput
              style={styles.input}
              value={formData.data_fim}
              onChangeText={(text) => setFormData({...formData, data_fim: text})}
              placeholder="YYYY-MM-DD"
            />
            
            <Text style={styles.label}>Quantidade de Pessoas</Text>
            <TextInput
              style={styles.input}
              value={formData.quantidade_pessoas}
              onChangeText={(text) => setFormData({...formData, quantidade_pessoas: text})}
              keyboardType="numeric"
              placeholder="1"
            />
            
            {!editingReserva && (
              <>
                <Text style={styles.label}>Valor Total</Text>
                <TextInput
                  style={styles.input}
                  value={formData.valor_total}
                  onChangeText={(text) => setFormData({...formData, valor_total: text})}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
                
                <Text style={styles.label}>ID da Acomodação (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.acomodacao_id}
                  onChangeText={(text) => setFormData({...formData, acomodacao_id: text})}
                  keyboardType="numeric"
                  placeholder="ID da acomodação"
                />
                
                <Text style={styles.label}>ID da Atividade (opcional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.atividade_id}
                  onChangeText={(text) => setFormData({...formData, atividade_id: text})}
                  keyboardType="numeric"
                  placeholder="ID da atividade"
                />
              </>
            )}
            
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={editingReserva ? handleUpdateReserva : handleCreateReserva}
            >
              <Text style={styles.saveButtonText}>
                {editingReserva ? 'Atualizar' : 'Criar'} Reserva
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  loadingText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#8E8E93' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 18, color: '#8E8E93' },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  status: { fontSize: 14, fontWeight: '600' },
  statusOk: { color: '#34C759' },
  statusPending: { color: '#FF9500' },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  editButton: {
    marginRight: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});