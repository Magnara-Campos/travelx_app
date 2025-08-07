import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../../contexts/AuthContext';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

interface ProfileFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  placeholder,
  editable = false,
  onChangeText,
  icon
}) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputContainer}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color="#8E8E93"
          style={styles.fieldIcon}
        />
      )}
      <TextInput
        style={[styles.textInput, !editable && styles.disabledInput]}
        value={value}
        placeholder={placeholder}
        editable={editable}
        onChangeText={onChangeText}
        placeholderTextColor="#8E8E93"
      />
    </View>
  </View>
);

interface SettingItemProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  showSwitch = false,
  switchValue = false,
  onSwitchChange
}) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <View style={styles.settingIcon}>
      <Ionicons name={icon} size={24} color="#007AFF" />
    </View>
    <View style={styles.settingContent}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {showSwitch ? (
      <Switch
        value={switchValue}
        onValueChange={onSwitchChange}
        trackColor={{ false: '#E5E5EA', true: '#007AFF' }}
        thumbColor="#FFFFFF"
      />
    ) : (
      <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
    )}
  </TouchableOpacity>
);

export default function PerfilGuia() {
  const { logout } = useAuth();
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    sobrenome: 'Santos',
    email: 'joao.silva@email.com',
    phone: '+55 (11) 99999-9999',
    bio: 'Guia turístico experiente com mais de 5 anos de experiência em São Paulo.',
    location: 'São Paulo, SP',
    languages: 'Português, Inglês, Espanhol'
  });

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    locationSharing: true
  });

  const handleSaveProfile = () => {
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
  };

  const handleChangePassword = () => {
    Alert.alert('Alterar Senha', 'Funcionalidade em desenvolvimento');
  };

  const handleViewDocuments = () => {
    Alert.alert('Documentos', 'Visualizar documentos enviados');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Ionicons name="person" size={60} color="#8E8E93" />
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <ProfileSection title="Informações Pessoais">
          <ProfileField
            label="Nome"
            value={profileData.name}
            placeholder="Digite seu nome"
            editable={true}
            onChangeText={(text) => setProfileData({...profileData, name: text})}
            icon="person"
          />
          <ProfileField
            label="Sobrenome"
            value={profileData.sobrenome}
            placeholder="Digite seu sobrenome"
            editable={true}
            onChangeText={(text) => setProfileData({...profileData, sobrenome: text})}
            icon="person"
          />
          <ProfileField
            label="Email"
            value={profileData.email}
            placeholder="Digite seu email"
            editable={true}
            onChangeText={(text) => setProfileData({...profileData, email: text})}
            icon="mail"
          />
          <ProfileField
            label="Telefone"
            value={profileData.phone}
            placeholder="Digite seu telefone"
            editable={true}
            onChangeText={(text) => setProfileData({...profileData, phone: text})}
            icon="call"
          />
        </ProfileSection>

        {/* Professional Information */}
        <ProfileSection title="Informações Profissionais">
          <ProfileField
            label="Localização"
            value={profileData.location}
            placeholder="Digite sua localização"
            editable={true}
            onChangeText={(text) => setProfileData({...profileData, location: text})}
            icon="location"
          />
          <ProfileField
            label="Idiomas"
            value={profileData.languages}
            placeholder="Digite os idiomas que você fala"
            editable={true}
            onChangeText={(text) => setProfileData({...profileData, languages: text})}
            icon="language"
          />
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Biografia</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={profileData.bio}
              placeholder="Conte um pouco sobre você..."
              multiline={true}
              numberOfLines={4}
              onChangeText={(text) => setProfileData({...profileData, bio: text})}
              placeholderTextColor="#8E8E93"
            />
          </View>
        </ProfileSection>

        {/* Settings */}
        <ProfileSection title="Configurações">
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Notificações"
              subtitle="Receber notificações de reservas"
              icon="notifications"
              onPress={() => {}}
              showSwitch={true}
              switchValue={settings.notifications}
              onSwitchChange={(value) => setSettings({...settings, notifications: value})}
            />
            <SettingItem
              title="Atualizações por Email"
              subtitle="Receber novidades por email"
              icon="mail"
              onPress={() => {}}
              showSwitch={true}
              switchValue={settings.emailUpdates}
              onSwitchChange={(value) => setSettings({...settings, emailUpdates: value})}
            />
            <SettingItem
              title="Compartilhar Localização"
              subtitle="Permitir que turistas vejam sua localização"
              icon="location"
              onPress={() => {}}
              showSwitch={true}
              switchValue={settings.locationSharing}
              onSwitchChange={(value) => setSettings({...settings, locationSharing: value})}
            />
          </View>
        </ProfileSection>

        {/* Account Actions */}
        <ProfileSection title="Conta">
          <View style={styles.settingsContainer}>
            <SettingItem
              title="Alterar Senha"
              subtitle="Modificar sua senha de acesso"
              icon="lock-closed"
              onPress={handleChangePassword}
            />
            <SettingItem
              title="Meus Documentos"
              subtitle="Visualizar documentos enviados"
              icon="document"
              onPress={handleViewDocuments}
            />
            <SettingItem
              title="Sair"
              subtitle="Fazer logout da aplicação"
              icon="log-out"
              onPress={handleLogout}
            />
          </View>
        </ProfileSection>
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  photoSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  changePhotoButton: {
    paddingVertical: 8,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  fieldContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    paddingVertical: 8,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    color: '#8E8E93',
  },
  settingsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
});