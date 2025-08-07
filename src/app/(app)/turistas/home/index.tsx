import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getNearbyPlaces, NearbyPlacesResponse } from '../../../../services/locationService';
import Slider from '@react-native-community/slider';

interface DestinationCardProps {
  title: string;
  location: string;
  rating: number;
  price: string;
  image?: string;
  onPress: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ title, location, rating, price, onPress }) => (
  <TouchableOpacity style={styles.destinationCard} onPress={onPress}>
    <View style={styles.destinationImage}>
      <Ionicons name="image" size={40} color="#8E8E93" />
    </View>
    <View style={styles.destinationInfo}>
      <Text style={styles.destinationTitle}>{title}</Text>
      <Text style={styles.destinationLocation}>{location}</Text>
      <View style={styles.destinationMeta}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FF9500" />
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
        <Text style={styles.priceText}>R$ {price}</Text>
      </View>
    </View>
  </TouchableOpacity>
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

export default function HomeTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = React.useState(true);
  const [nearbyPlaces, setNearbyPlaces] = React.useState<NearbyPlacesResponse | null>(null);
  const [loadingPlaces, setLoadingPlaces] = React.useState(false);
  const [raio, setRaio] = React.useState(50); // Raio inicial 50km

  // Buscar lugares próximos sempre que localização ou raio mudar
  React.useEffect(() => {
    if (!location) return;
    setLoadingPlaces(true);
    console.log('Latitude:', location.latitude, 'Longitude:', location.longitude, 'Raio:', raio);
    getNearbyPlaces(location.latitude, location.longitude, raio)
      .then((places) => {
        setNearbyPlaces(places);
        if (places) {
          console.log('--- Resposta da API ---');
          console.log('Paisagens:', places.paisagens?.length, places.paisagens);
          console.log('Acomodações:', places.acomodacoes?.length, places.acomodacoes);
          console.log('Restaurantes:', places.restaurantes?.length, places.restaurantes);
          console.log('Eventos:', places.eventos?.length, places.eventos);
        } else {
          console.log('Resposta da API: null ou vazia');
        }
      })
      .catch((err) => {
        console.log('Erro ao buscar lugares próximos:', err);
      })
      .finally(() => setLoadingPlaces(false));
  }, [location, raio]);

  // Buscar localização ao entrar
  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoadingLocation(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoadingLocation(false);
    })();
  }, []);

  const handleExploreDestinations = () => {
    console.log('Explorar destinos');
  };

  const handleViewBookings = () => {
    console.log('Ver minhas viagens');
  };

  const handleViewFavorites = () => {
    console.log('Ver favoritos');
  };

  const handleViewProfile = () => {
    console.log('Ver perfil');
  };

  const handleViewNotifications = () => {
    console.log('Ver notificações');
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Home" />
      {/* Slider de raio */}
      <View style={{ paddingHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Raio de busca: {raio} km</Text>
        <Slider
          minimumValue={1}
          maximumValue={100}
          step={1}
          value={raio}
          onValueChange={setRaio}
          minimumTrackTintColor="#007AFF"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#007AFF"
        />
      </View>
      <MapView
        style={{ width: '100%', height: 220, borderRadius: 18, marginBottom: 18 }}
        initialRegion={{
          latitude: location?.latitude || -23.55052,
          longitude: location?.longitude || -46.633308,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        } : undefined}
      >
        {location && (
          <Marker coordinate={location} title="Você está aqui" />
        )}
        {/* Markers para lugares próximos */}
        {nearbyPlaces?.paisagens?.map((p, idx) => (
          p.endereco && (
            <Marker
              key={`paisagem-${idx}`}
              coordinate={{ latitude: p.endereco.latitude, longitude: p.endereco.longitude }}
              title={p.nome || 'Paisagem'}
              description="Paisagem"
              pinColor="green"
            />
          )
        ))}
        {nearbyPlaces?.acomodacoes?.map((a, idx) => (
          a.endereco && (
            <Marker
              key={`acomodacao-${idx}`}
              coordinate={{ latitude: a.endereco.latitude, longitude: a.endereco.longitude }}
              title={a.nome || 'Acomodação'}
              description="Acomodação"
              pinColor="blue"
            />
          )
        ))}
        {nearbyPlaces?.restaurantes?.map((r, idx) => (
          r.endereco && (
            <Marker
              key={`restaurante-${idx}`}
              coordinate={{ latitude: r.endereco.latitude, longitude: r.endereco.longitude }}
              title={r.nome || 'Restaurante'}
              description="Restaurante"
              pinColor="red"
            />
          )
        ))}
        {nearbyPlaces?.eventos?.map((e, idx) => (
          e.endereco && (
            <Marker
              key={`evento-${idx}`}
              coordinate={{ latitude: e.endereco.latitude, longitude: e.endereco.longitude }}
              title={e.nome || 'Evento'}
              description="Evento"
              pinColor="orange"
            />
          )
        ))}
      </MapView>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Ações rápidas */}
        <View style={{ marginBottom: 28 }}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsContainer}>
            <QuickAction
              title="Explorar Destinos"
              subtitle="Descubra novos lugares"
              icon="compass"
              onPress={handleExploreDestinations}
            />
            <QuickAction
              title="Minhas Viagens"
              subtitle="Ver reservas e histórico"
              icon="airplane"
              onPress={handleViewBookings}
            />
            <QuickAction
              title="Favoritos"
              subtitle="Destinos salvos"
              icon="heart"
              onPress={handleViewFavorites}
            />
            <QuickAction
              title="Notificações"
              subtitle="Ver mensagens"
              icon="notifications"
              onPress={handleViewNotifications}
            />
          </View>
        </View>
        {/* Destinos Populares */}
        <View style={{ marginBottom: 28 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destinos Populares</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <DestinationCard
              title="São Paulo"
              location="Brasil"
              rating={4.8}
              price="120,00"
              onPress={() => console.log('São Paulo')}
            />
            <DestinationCard
              title="Rio de Janeiro"
              location="Brasil"
              rating={4.9}
              price="150,00"
              onPress={() => console.log('Rio de Janeiro')}
            />
            <DestinationCard
              title="Salvador"
              location="Brasil"
              rating={4.7}
              price="100,00"
              onPress={() => console.log('Salvador')}
            />
          </ScrollView>
        </View>
        {/* Atividade Recente */}
        <View style={{ marginBottom: 28 }}>
          <Text style={styles.sectionTitle}>Atividade Recente</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.activityTitle}>Reserva confirmada</Text>
              <Text style={styles.activityTime}>2h atrás</Text>
            </View>
            <Text style={styles.activityDescription}>
              Sua reserva para "Centro Histórico de São Paulo" foi confirmada
            </Text>
          </View>
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Ionicons name="star" size={20} color="#FF9500" />
              <Text style={styles.activityTitle}>Avaliação enviada</Text>
              <Text style={styles.activityTime}>1 dia atrás</Text>
            </View>
            <Text style={styles.activityDescription}>
              Você avaliou o passeio "Vila Madalena" com 5 estrelas
            </Text>
          </View>
        </View>
        {/* Ofertas Especiais */}
        <View style={{ marginBottom: 28 }}>
          <Text style={styles.sectionTitle}>Ofertas Especiais</Text>
          <View style={styles.offerCard}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>Desconto de 20%</Text>
              <Text style={styles.offerDescription}>
                Em passeios selecionados para novos usuários
              </Text>
              <TouchableOpacity style={styles.offerButton}>
                <Text style={styles.offerButtonText}>Ver ofertas</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.offerIcon}>
              <Ionicons name="gift" size={40} color="#FF3B30" />
            </View>
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchText: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 12,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
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
  destinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationImage: {
    height: 120,
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    padding: 12,
  },
  destinationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  destinationLocation: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  destinationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
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
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
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
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  offerButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  offerIcon: {
    marginLeft: 16,
  },
});