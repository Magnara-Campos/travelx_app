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

interface Booking {
  id: string;
  tourTitle: string;
  customerName: string;
  customerEmail: string;
  date: string;
  time: string;
  participants: number;
  totalPrice: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  customerPhone?: string;
}

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress, onConfirm, onCancel }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#34C759';
      case 'pending': return '#FF9500';
      case 'cancelled': return '#FF3B30';
      case 'completed': return '#007AFF';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelada';
      case 'completed': return 'Concluída';
      default: return 'Desconhecido';
    }
  };

  return (
    <TouchableOpacity style={styles.bookingCard} onPress={onPress}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.tourTitle}>{booking.tourTitle}</Text>
          <Text style={styles.customerName}>{booking.customerName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{getStatusText(booking.status)}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{booking.date}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{booking.time}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>{booking.participants} pessoas</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color="#8E8E93" />
            <Text style={styles.detailText}>R$ {booking.totalPrice}</Text>
          </View>
        </View>
      </View>

      {booking.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.confirmButton]} onPress={onConfirm}>
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={onCancel}>
            <Ionicons name="close" size={16} color="#FFFFFF" />
            <Text style={styles.cancelButtonText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      )}
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

export default function ReservasGuia() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      tourTitle: 'Centro Histórico de São Paulo',
      customerName: 'Maria Silva',
      customerEmail: 'maria.silva@email.com',
      customerPhone: '+55 (11) 99999-9999',
      date: '15/12/2024',
      time: '09:00',
      participants: 2,
      totalPrice: '240,00',
      status: 'confirmed'
    },
    {
      id: '2',
      tourTitle: 'Vila Madalena - Arte e Cultura',
      customerName: 'João Santos',
      customerEmail: 'joao.santos@email.com',
      customerPhone: '+55 (11) 88888-8888',
      date: '18/12/2024',
      time: '14:00',
      participants: 4,
      totalPrice: '600,00',
      status: 'pending'
    },
    {
      id: '3',
      tourTitle: 'Parque Ibirapuera',
      customerName: 'Ana Costa',
      customerEmail: 'ana.costa@email.com',
      customerPhone: '+55 (11) 77777-7777',
      date: '20/12/2024',
      time: '10:00',
      participants: 1,
      totalPrice: '80,00',
      status: 'completed'
    },
    {
      id: '4',
      tourTitle: 'Centro Histórico de São Paulo',
      customerName: 'Pedro Lima',
      customerEmail: 'pedro.lima@email.com',
      customerPhone: '+55 (11) 66666-6666',
      date: '22/12/2024',
      time: '15:00',
      participants: 3,
      totalPrice: '360,00',
      status: 'cancelled'
    }
  ]);

  const filteredBookings = bookings.filter(booking => {
    if (activeFilter === 'all') return true;
    return booking.status === activeFilter;
  });

  const handleConfirmBooking = (bookingId: string) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'confirmed' as const }
        : booking
    ));
    Alert.alert('Sucesso', 'Reserva confirmada com sucesso!');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
    Alert.alert('Reserva Cancelada', 'A reserva foi cancelada.');
  };

  const handleViewBooking = (booking: Booking) => {
    Alert.alert(
      'Detalhes da Reserva',
      `Turista: ${booking.customerName}\nEmail: ${booking.customerEmail}\nTelefone: ${booking.customerPhone || 'Não informado'}`
    );
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <BookingCard
      booking={item}
      onPress={() => handleViewBooking(item)}
      onConfirm={() => handleConfirmBooking(item.id)}
      onCancel={() => handleCancelBooking(item.id)}
    />
  );

  const getStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const revenue = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.totalPrice.replace(',', '.')), 0);

    return { total, confirmed, pending, completed, revenue };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reservas</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.confirmed}</Text>
          <Text style={styles.statLabel}>Confirmadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>R$ {stats.revenue.toFixed(2).replace('.', ',')}</Text>
          <Text style={styles.statLabel}>Receita</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton
            title="Todas"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterButton
            title="Pendentes"
            active={activeFilter === 'pending'}
            onPress={() => setActiveFilter('pending')}
          />
          <FilterButton
            title="Confirmadas"
            active={activeFilter === 'confirmed'}
            onPress={() => setActiveFilter('confirmed')}
          />
          <FilterButton
            title="Concluídas"
            active={activeFilter === 'completed'}
            onPress={() => setActiveFilter('completed')}
          />
          <FilterButton
            title="Canceladas"
            active={activeFilter === 'cancelled'}
            onPress={() => setActiveFilter('cancelled')}
          />
        </ScrollView>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        style={styles.bookingsList}
        contentContainerStyle={styles.bookingsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Nenhuma reserva encontrada</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Ainda não há reservas para seus passeios'
                : 'Não há reservas com este status'
              }
            </Text>
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
  refreshButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  bookingsList: {
    flex: 1,
  },
  bookingsListContent: {
    padding: 20,
  },
  bookingCard: {
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
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  tourTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  },
});