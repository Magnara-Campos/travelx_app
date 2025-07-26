import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={styles.statHeader}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.statTitle}>{title}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, subtitle, icon, onPress }) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <View style={styles.actionIcon}>
      <Ionicons name={icon} size={28} color="#007AFF" />
    </View>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
  </TouchableOpacity>
);

export default function HomeGuia() {
  const handleCreateTour = () => {
    // Navegar para criar passeio
    console.log('Criar novo passeio');
  };

  const handleViewBookings = () => {
    // Navegar para reservas
    console.log('Ver reservas');
  };

  const handleViewProfile = () => {
    // Navegar para perfil
    console.log('Ver perfil');
  };

  const handleViewNotifications = () => {
    // Navegar para notificações
    console.log('Ver notificações');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bem-vindo de volta!</Text>
            <Text style={styles.name}>João Silva</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Passeios Ativos"
            value="12"
            icon="map"
            color="#34C759"
          />
          <StatCard
            title="Reservas Hoje"
            value="8"
            icon="calendar"
            color="#FF9500"
          />
          <StatCard
            title="Avaliação"
            value="4.8"
            icon="star"
            color="#FF3B30"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsContainer}>
            <QuickAction
              title="Criar Passeio"
              subtitle="Adicionar novo roteiro"
              icon="add-circle"
              onPress={handleCreateTour}
            />
            <QuickAction
              title="Ver Reservas"
              subtitle="Gerenciar reservas"
              icon="bookmark"
              onPress={handleViewBookings}
            />
            <QuickAction
              title="Meu Perfil"
              subtitle="Editar informações"
              icon="person"
              onPress={handleViewProfile}
            />
            <QuickAction
              title="Notificações"
              subtitle="Ver mensagens"
              icon="notifications"
              onPress={handleViewNotifications}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.activityTitle}>Passeio confirmado</Text>
              <Text style={styles.activityTime}>2h atrás</Text>
            </View>
            <Text style={styles.activityDescription}>
              Passeio "Centro Histórico" confirmado para amanhã às 9h
            </Text>
          </View>

          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="star" size={20} color="#FF9500" />
              <Text style={styles.activityTitle}>Nova avaliação</Text>
              <Text style={styles.activityTime}>4h atrás</Text>
            </View>
            <Text style={styles.activityDescription}>
              Maria Silva deixou uma avaliação 5 estrelas
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollView: {
    flex: 1,
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
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileButton: {
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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  activityTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  activityDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
});