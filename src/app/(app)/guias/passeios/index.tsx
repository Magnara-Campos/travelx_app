import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tour {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: string;
  price: string;
  rating: number;
  bookings: number;
  status: 'active' | 'inactive' | 'draft';
  image?: string;
}

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TourCard: React.FC<TourCardProps> = ({ tour, onPress, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#34C759';
      case 'inactive': return '#FF3B30';
      case 'draft': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'draft': return 'Rascunho';
      default: return 'Desconhecido';
    }
  };

  return (
    <TouchableOpacity style={styles.tourCard} onPress={onPress}>
      <View style={styles.tourHeader}>
        <View style={styles.tourInfo}>
          <Text style={styles.tourTitle}>{tour.title}</Text>
          <View style={styles.tourMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{tour.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time" size={16} color="#8E8E93" />
              <Text style={styles.metaText}>{tour.duration}</Text>
            </View>
          </View>
        </View>
        <View style={styles.tourActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Ionicons name="create" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.tourDescription} numberOfLines={2}>
        {tour.description}
      </Text>

      <View style={styles.tourFooter}>
        <View style={styles.tourStats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#FF9500" />
            <Text style={styles.statText}>{tour.rating}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="people" size={16} color="#007AFF" />
            <Text style={styles.statText}>{tour.bookings} reservas</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="cash" size={16} color="#34C759" />
            <Text style={styles.statText}>R$ {tour.price}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tour.status) }]}>
          <Text style={styles.statusText}>{getStatusText(tour.status)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface FilterButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ title, active, onPress }) => (
  <TouchableOpacity
    style={[styles.filterButton, active && styles.filterButtonActive]}
    onPress={onPress}
  >
    <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function PasseiosGuia() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [tours, setTours] = useState<Tour[]>([
    {
      id: '1',
      title: 'Centro Histórico de São Paulo',
      description: 'Explore os principais pontos históricos da cidade, incluindo o Pátio do Colégio, Sé e Mercado Municipal.',
      location: 'Centro, São Paulo',
      duration: '3 horas',
      price: '120,00',
      rating: 4.8,
      bookings: 15,
      status: 'active'
    },
    {
      id: '2',
      title: 'Vila Madalena - Arte e Cultura',
      description: 'Conheça a região mais boêmia da cidade, com galerias de arte, bares e street art.',
      location: 'Vila Madalena, São Paulo',
      duration: '4 horas',
      price: '150,00',
      rating: 4.6,
      bookings: 8,
      status: 'active'
    },
    {
      id: '3',
      title: 'Parque Ibirapuera',
      description: 'Passeio pelo maior parque urbano da cidade, com arquitetura de Niemeyer e museus.',
      location: 'Ibirapuera, São Paulo',
      duration: '2 horas',
      price: '80,00',
      rating: 4.9,
      bookings: 22,
      status: 'draft'
    }
  ]);

  const filteredTours = tours.filter(tour => {
    if (activeFilter === 'all') return true;
    return tour.status === activeFilter;
  });

  const handleCreateTour = () => {
    Alert.alert('Criar Passeio', 'Funcionalidade em desenvolvimento');
  };

  const handleEditTour = (tourId: string) => {
    Alert.alert('Editar Passeio', `Editar passeio ${tourId}`);
  };

  const handleDeleteTour = (tourId: string) => {
    Alert.alert(
      'Excluir Passeio',
      'Tem certeza que deseja excluir este passeio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setTours(tours.filter(tour => tour.id !== tourId));
          }
        }
      ]
    );
  };

  const handleViewTour = (tour: Tour) => {
    Alert.alert('Ver Passeio', `Visualizar detalhes de ${tour.title}`);
  };

  const renderTour = ({ item }: { item: Tour }) => (
    <TourCard
      tour={item}
      onPress={() => handleViewTour(item)}
      onEdit={() => handleEditTour(item.id)}
      onDelete={() => handleDeleteTour(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Passeios</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTour}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{tours.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {tours.filter(t => t.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Ativos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {tours.reduce((sum, t) => sum + t.bookings, 0)}
          </Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="Todos"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterButton
            title="Ativos"
            active={activeFilter === 'active'}
            onPress={() => setActiveFilter('active')}
          />
          <FilterButton
            title="Rascunhos"
            active={activeFilter === 'draft'}
            onPress={() => setActiveFilter('draft')}
          />
          <FilterButton
            title="Inativos"
            active={activeFilter === 'inactive'}
            onPress={() => setActiveFilter('inactive')}
          />
        </ScrollView>
      </View>

      {/* Tours List */}
      <FlatList
        data={filteredTours}
        renderItem={renderTour}
        keyExtractor={(item) => item.id}
        style={styles.toursList}
        contentContainerStyle={styles.toursListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Nenhum passeio encontrado</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Crie seu primeiro passeio para começar'
                : 'Não há passeios com este status'
              }
            </Text>
            {activeFilter === 'all' && (
              <TouchableOpacity style={styles.emptyButton} onPress={handleCreateTour}>
                <Text style={styles.emptyButtonText}>Criar Passeio</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  createButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  toursList: {
    flex: 1,
  },
  toursListContent: {
    padding: 20,
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tourInfo: {
    flex: 1,
  },
  tourTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  tourMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  tourActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  tourDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 16,
  },
  tourFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tourStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});