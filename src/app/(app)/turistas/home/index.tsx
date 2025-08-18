import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../../../components/header/Header';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { getNearbyPlaces, NearbyPlacesResponse } from '../../../../services/locationService';
import { fetchDestinos, Destino } from '../../../../services/destinoService';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';

interface DestinationCardProps {
  title: string;
  location: string;
  rating: number | null;
  onPress: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({ title, location, rating, onPress }) => (
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
          <Text style={styles.ratingText}>{rating ?? 'N/A'}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const QuickAction: React.FC<{ icon: keyof typeof Ionicons.glyphMap; onPress: () => void }> = ({ icon, onPress }) => (
  <TouchableOpacity style={styles.actionIconOnly} onPress={onPress}>
    <Ionicons name={icon} size={28} color="#007AFF" />
  </TouchableOpacity>
);

export default function HomeTurista() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = React.useState(true);
  const [nearbyPlaces, setNearbyPlaces] = React.useState<NearbyPlacesResponse | null>(null);
  const [loadingPlaces, setLoadingPlaces] = React.useState(false);
  const [raio, setRaio] = React.useState(10);
  const [destinos, setDestinos] = React.useState<Destino[]>([]);
  const [loadingDestinos, setLoadingDestinos] = React.useState(false);

  // Pegar localização do usuário
  React.useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('[HomeTurista] Permissão de localização negada');
        setLoadingLocation(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setLoadingLocation(false);
    })();
  }, []);

  // Buscar lugares próximos
  React.useEffect(() => {
    if (!location) return;
    setLoadingPlaces(true);
    getNearbyPlaces(location.latitude, location.longitude, raio)
      .then((response) => {
        setNearbyPlaces(response);
      })
      .catch((err) => console.log('[HomeTurista] Erro ao buscar lugares próximos:', err))
      .finally(() => setLoadingPlaces(false));
  }, [location, raio]);

  // Carregar destinos
  React.useEffect(() => {
    setLoadingDestinos(true);
    fetchDestinos()
      .then((response) => {
        if (response) {
          setDestinos(response.data);
        } else {
          setDestinos([]);
        }
      })
      .catch((err) => console.log('[HomeTurista] Erro ao carregar destinos:', err))
      .finally(() => setLoadingDestinos(false));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <Header nome={user?.name || 'Turista'} tipoUsuario="turista" titulo="Home" />

      {/* Slider de raio */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Raio de busca: {raio} km</Text>
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

      {/* Mapa */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.latitude || -8.8368, // Luanda como padrão
          longitude: location?.longitude || 13.2343,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0122 * (raio / 10),
          longitudeDelta: 0.0121 * (raio / 10),
        } : undefined}
      >
        {location && <Marker coordinate={location} title="Você está aqui" />}
        {nearbyPlaces?.paisagens?.map((p, idx) => p.endereco?.latitude && p.endereco?.longitude && (
          <Marker
            key={`paisagem-${idx}`}
            coordinate={{ latitude: p.endereco.latitude, longitude: p.endereco.longitude }}
            title={p.nome || 'Paisagem'}
            pinColor="green"
          />
        ))}
        {nearbyPlaces?.acomodacoes?.map((a, idx) => a.endereco?.latitude && a.endereco?.longitude && (
          <Marker
            key={`acomodacao-${idx}`}
            coordinate={{ latitude: a.endereco.latitude, longitude: a.endereco.longitude }}
            title={a.nome || 'Acomodação'}
            pinColor="blue"
          />
        ))}
        {nearbyPlaces?.restaurantes?.map((r, idx) => r.endereco?.latitude && r.endereco?.longitude && (
          <Marker
            key={`restaurante-${idx}`}
            coordinate={{ latitude: r.endereco.latitude, longitude: r.endereco.longitude }}
            title={r.nome || 'Restaurante'}
            pinColor="red"
          />
        ))}
        {nearbyPlaces?.eventos?.map((e, idx) => e.endereco?.latitude && e.endereco?.longitude && (
          <Marker
            key={`evento-${idx}`}
            coordinate={{ latitude: e.endereco.latitude, longitude: e.endereco.longitude }}
            title={e.nome || 'Evento'}
            pinColor="orange"
          />
        ))}
        {destinos?.map((d, idx) => d.latitude && d.longitude && (
          <Marker
            key={`destino-${idx}`}
            coordinate={{ latitude: d.latitude, longitude: d.longitude }}
            title={d.nome}
            pinColor="purple"
          />
        ))}
      </MapView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Ações rápidas */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.actionsRow}>
            <QuickAction icon="compass" onPress={() => router.push("/destinos")} />
            <QuickAction icon="airplane" onPress={() => router.push("/viagens")} />
            <QuickAction icon="heart" onPress={() => router.push("/favoritos")} />
            <QuickAction icon="notifications" onPress={() => router.push("/notificacoes")} />
          </View>
        </View>

        {/* Destinos Populares */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Destinos Populares</Text>
            <TouchableOpacity onPress={() => router.push("/destinos")}>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {loadingDestinos ? (
              <Text>Carregando destinos...</Text>
            ) : destinos.length === 0 ? (
              <Text>Nenhum destino encontrado.</Text>
            ) : (
              destinos.slice(0, 5).map((d) => (
                <DestinationCard
                  key={d.id}
                  title={d.nome}
                  location={`${d.regiao}, ${d.pais}`}
                  rating={d.avaliacao_media}
                  onPress={() => router.push(`/destinos/${d.id}`)}
                />
              ))
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  scrollView: { flex: 1 },
  map: { width: '100%', height: '50%', borderRadius: 18, marginVertical: 18 },
  sliderContainer: { paddingHorizontal: 20, marginBottom: 10 },
  sliderLabel: { fontWeight: 'bold', marginBottom: 4 },
  sectionContainer: { marginBottom: 28, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  seeAllText: { fontSize: 14, color: '#007AFF', fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12 },
  actionIconOnly: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
  destinationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, marginRight: 16, width: 200, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
  destinationImage: { height: 120, backgroundColor: '#F2F2F7', borderTopLeftRadius: 12, borderTopRightRadius: 12, justifyContent: 'center', alignItems: 'center' },
  destinationInfo: { padding: 12 },
  destinationTitle: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  destinationLocation: { fontSize: 14, color: '#8E8E93', marginBottom: 8 },
  destinationMeta: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 14, color: '#8E8E93', marginLeft: 4 },
});