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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'review' | 'system' | 'payment';
  isRead: boolean;
  timestamp: string;
  data?: any;
}

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onMarkAsRead: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress, onMarkAsRead }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'booking': return 'calendar';
      case 'review': return 'star';
      case 'system': return 'settings';
      case 'payment': return 'card';
      default: return 'notifications';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'booking': return '#007AFF';
      case 'review': return '#FF9500';
      case 'system': return '#8E8E93';
      case 'payment': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'booking': return 'Reserva';
      case 'review': return 'Avaliação';
      case 'system': return 'Sistema';
      case 'payment': return 'Pagamento';
      default: return 'Notificação';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.notificationCard, !notification.isRead && styles.unreadCard]}
      onPress={onPress}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Ionicons
            name={getTypeIcon(notification.type) as any}
            size={20}
            color={getTypeColor(notification.type)}
          />
        </View>
        <View style={styles.notificationContent}>
          <View style={styles.notificationTitleRow}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <View style={styles.notificationMeta}>
              <Text style={styles.notificationType}>{getTypeText(notification.type)}</Text>
              <Text style={styles.notificationTime}>{notification.timestamp}</Text>
            </View>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
        </View>
        {!notification.isRead && (
          <View style={styles.unreadIndicator} />
        )}
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

export default function NotificacoesGuia() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Nova Reserva Confirmada',
      message: 'Maria Silva confirmou reserva para o passeio "Centro Histórico" no dia 15/12 às 9h.',
      type: 'booking',
      isRead: false,
      timestamp: '2h atrás'
    },
    {
      id: '2',
      title: 'Nova Avaliação Recebida',
      message: 'João Santos deixou uma avaliação 5 estrelas para o passeio "Vila Madalena".',
      type: 'review',
      isRead: false,
      timestamp: '4h atrás'
    },
    {
      id: '3',
      title: 'Pagamento Recebido',
      message: 'Pagamento de R$ 240,00 recebido para a reserva do passeio "Centro Histórico".',
      type: 'payment',
      isRead: true,
      timestamp: '1 dia atrás'
    },
    {
      id: '4',
      title: 'Manutenção Programada',
      message: 'O sistema ficará indisponível das 2h às 4h da manhã para manutenção.',
      type: 'system',
      isRead: true,
      timestamp: '2 dias atrás'
    },
    {
      id: '5',
      title: 'Reserva Cancelada',
      message: 'Ana Costa cancelou a reserva para o passeio "Parque Ibirapuera" do dia 20/12.',
      type: 'booking',
      isRead: true,
      timestamp: '3 dias atrás'
    }
  ]);

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    return notification.type === activeFilter;
  });

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, isRead: true }
        : notification
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    Alert.alert('Sucesso', 'Todas as notificações foram marcadas como lidas!');
  };

  const handleViewNotification = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    Alert.alert(
      notification.title,
      notification.message,
      [{ text: 'OK' }]
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard
      notification={item}
      onPress={() => handleViewNotification(item)}
      onMarkAsRead={() => handleMarkAsRead(item.id)}
    />
  );

  const getStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.isRead).length;
    const today = notifications.filter(n =>
      n.timestamp.includes('h') || n.timestamp.includes('min')
    ).length;

    return { total, unread, today };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.unread}</Text>
          <Text style={styles.statLabel}>Não lidas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.today}</Text>
          <Text style={styles.statLabel}>Hoje</Text>
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
            title="Reservas"
            active={activeFilter === 'booking'}
            onPress={() => setActiveFilter('booking')}
          />
          <FilterButton
            title="Avaliações"
            active={activeFilter === 'review'}
            onPress={() => setActiveFilter('review')}
          />
          <FilterButton
            title="Pagamentos"
            active={activeFilter === 'payment'}
            onPress={() => setActiveFilter('payment')}
          />
          <FilterButton
            title="Sistema"
            active={activeFilter === 'system'}
            onPress={() => setActiveFilter('system')}
          />
        </ScrollView>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        style={styles.notificationsList}
        contentContainerStyle={styles.notificationsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Nenhuma notificação encontrada</Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'all'
                ? 'Você está em dia com suas notificações'
                : 'Não há notificações deste tipo'
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
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
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
  notificationsList: {
    flex: 1,
  },
  notificationsListContent: {
    padding: 20,
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
  },
  notificationMeta: {
    alignItems: 'flex-end',
  },
  notificationType: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    marginTop: 4,
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