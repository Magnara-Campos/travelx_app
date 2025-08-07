import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { authService, RegisterData, USER_TYPES, validateRegisterData, DOCUMENT_TYPES, DocumentoData } from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<'administrador' | 'guiaTurista' | 'turista'>('turista');
  const [perfilProfissional, setPerfilProfissional] = useState('');
  const [documentos, setDocumentos] = useState<DocumentoData[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { register } = useAuth();

  const pickDocument = async (tipoDocumento: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];

        // Verificar se o arquivo já foi adicionado
        const existingDoc = documentos.find(doc => doc.tipo_documento === tipoDocumento);
        if (existingDoc) {
          Alert.alert('Documento já adicionado', 'Este tipo de documento já foi selecionado.');
          return;
        }

        const newDocumento: DocumentoData = {
          tipo_documento: tipoDocumento as any,
          arquivo: {
            uri: asset.uri,
            type: asset.mimeType || 'application/octet-stream',
            name: asset.name,
            size: asset.size,
          },
        };

        setDocumentos([...documentos, newDocumento]);
      }
    } catch (error) {
      console.error('Erro ao selecionar documento:', error);
      Alert.alert('Erro', 'Erro ao selecionar documento');
    }
  };

  const removeDocument = (tipoDocumento: string) => {
    setDocumentos(documentos.filter(doc => doc.tipo_documento !== tipoDocumento));
  };

  const getRequiredDocuments = () => {
    if (tipoUsuario === USER_TYPES.TURISTA) {
      return [
        { tipo: DOCUMENT_TYPES.PASSAPORTE, label: 'Passaporte' },
        { tipo: DOCUMENT_TYPES.DOCUMENTO_IDENTIDADE, label: 'Documento de Identidade' },
      ];
    } else if (tipoUsuario === USER_TYPES.GUIA_TURISTA) {
      return [
        { tipo: DOCUMENT_TYPES.DOCUMENTO_IDENTIDADE, label: 'Documento de Identidade' },
        { tipo: DOCUMENT_TYPES.LICENCA_GUIA, label: 'Licença de Guia' },
      ];
    }
    return [];
  };

  const handleRegister = async () => {
    if (!name || !sobrenome || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres');
      return;
    }

    if (!acceptedTerms) {
      Alert.alert('Erro', 'Você deve aceitar os termos de uso');
      return;
    }

    // Validação específica por tipo de usuário
    const userData: RegisterData = {
      name,
      sobrenome,
      email,
      password,
      tipo_usuario: tipoUsuario,
      documentos: documentos.length > 0 ? documentos : undefined,
      perfil_profissional: tipoUsuario === USER_TYPES.GUIA_TURISTA ? { nome: perfilProfissional } : undefined,
    };

    const validationErrors = validateRegisterData(userData);
    if (validationErrors.length > 0) {
      Alert.alert('Erro de Validação', validationErrors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      const success = await register(userData);

      if (success) {
        console.log('Registration successful');
        Alert.alert(
          'Sucesso!',
          'Conta criada com sucesso!',
          [
            {
              text: 'OK'
              // A navegação será automática baseada no tipo de usuário
            }
          ]
        );
      } else {
        Alert.alert('Erro', 'Falha no cadastro. Verifique os dados informados.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Erro', 'Erro de conexão. Verifique sua internet.');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0A1A24' : '#FFFFFF',
    },
    scrollView: {
      flex: 1,
      paddingHorizontal: 24,
    },
    header: {
      marginTop: 60,
      marginBottom: 40,
    },
    backButton: {
      marginBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: isDark ? '#B0C4D4' : '#6B7280',
      marginBottom: 40,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#374151',
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1A2A35' : '#F9FAFB',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2A3A45' : '#E5E7EB',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      color: isDark ? '#FFFFFF' : '#1A1A1A',
      paddingVertical: 0,
    },
    iconButton: {
      padding: 4,
    },
    tipoUsuarioContainer: {
      marginBottom: 20,
    },
    tipoUsuarioLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#374151',
      marginBottom: 8,
    },
    tipoUsuarioButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    tipoUsuarioButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 2,
      alignItems: 'center',
    },
    tipoUsuarioButtonActive: {
      backgroundColor: '#4A90E2',
      borderColor: '#4A90E2',
    },
    tipoUsuarioButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: isDark ? '#2A3A45' : '#E5E7EB',
    },
    tipoUsuarioButtonText: {
      fontSize: 14,
      fontWeight: '600',
    },
    tipoUsuarioButtonTextActive: {
      color: '#FFFFFF',
    },
    tipoUsuarioButtonTextInactive: {
      color: isDark ? '#B0C4D4' : '#6B7280',
    },
    documentosContainer: {
      marginBottom: 20,
    },
    documentosLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#374151',
      marginBottom: 8,
    },
    documentoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#1A2A35' : '#F9FAFB',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2A3A45' : '#E5E7EB',
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8,
    },
    documentoInfo: {
      flex: 1,
    },
    documentoName: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    documentoType: {
      fontSize: 12,
      color: isDark ? '#B0C4D4' : '#6B7280',
    },
    documentoRemove: {
      padding: 4,
    },
    addDocumentButton: {
      backgroundColor: isDark ? '#1A2A35' : '#F9FAFB',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDark ? '#2A3A45' : '#E5E7EB',
      borderStyle: 'dashed',
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 8,
    },
    addDocumentText: {
      fontSize: 14,
      color: isDark ? '#B0C4D4' : '#6B7280',
      fontWeight: '600',
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 32,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#4A90E2',
      marginRight: 12,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#4A90E2',
    },
    termsText: {
      flex: 1,
      fontSize: 14,
      color: isDark ? '#B0C4D4' : '#6B7280',
      lineHeight: 20,
    },
    termsLink: {
      color: '#4A90E2',
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: '#4A90E2',
      borderRadius: 12,
      paddingVertical: 16,
      marginBottom: 24,
      shadowColor: '#4A90E2',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      opacity: (!acceptedTerms || loading) ? 0.6 : 1,
    },
    registerButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: isDark ? '#2A3A45' : '#E5E7EB',
    },
    dividerText: {
      marginHorizontal: 16,
      color: isDark ? '#B0C4D4' : '#6B7280',
      fontSize: 14,
    },
    socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? '#1A2A35' : '#F9FAFB',
      borderRadius: 12,
      paddingVertical: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: isDark ? '#2A3A45' : '#E5E7EB',
    },
    socialButtonText: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#FFFFFF' : '#1A1A1A',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
      marginBottom: 40,
    },
    loginText: {
      color: isDark ? '#B0C4D4' : '#6B7280',
      fontSize: 14,
    },
    loginLink: {
      color: '#4A90E2',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
          </TouchableOpacity>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Preencha os dados para começar</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nome</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#B0C4D4' : '#6B7280'} />
            <TextInput
              style={styles.textInput}
              placeholder="Digite seu nome"
              placeholderTextColor={isDark ? '#B0C4D4' : '#9CA3AF'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Sobrenome</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={isDark ? '#B0C4D4' : '#6B7280'} />
            <TextInput
              style={styles.textInput}
              placeholder="Digite seu sobrenome"
              placeholderTextColor={isDark ? '#B0C4D4' : '#9CA3AF'}
              value={sobrenome}
              onChangeText={setSobrenome}
              autoCapitalize="words"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={isDark ? '#B0C4D4' : '#6B7280'} />
            <TextInput
              style={styles.textInput}
              placeholder="Digite seu email"
              placeholderTextColor={isDark ? '#B0C4D4' : '#9CA3AF'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
        </View>

        <View style={styles.tipoUsuarioContainer}>
          <Text style={styles.tipoUsuarioLabel}>Tipo de Usuário</Text>
          <View style={styles.tipoUsuarioButtons}>
            <TouchableOpacity
              style={[
                styles.tipoUsuarioButton,
                tipoUsuario === USER_TYPES.TURISTA
                  ? styles.tipoUsuarioButtonActive
                  : styles.tipoUsuarioButtonInactive
              ]}
              onPress={() => setTipoUsuario(USER_TYPES.TURISTA)}
              disabled={loading}
            >
              <Text style={[
                styles.tipoUsuarioButtonText,
                tipoUsuario === USER_TYPES.TURISTA
                  ? styles.tipoUsuarioButtonTextActive
                  : styles.tipoUsuarioButtonTextInactive
              ]}>
                Turista
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tipoUsuarioButton,
                tipoUsuario === USER_TYPES.GUIA_TURISTA
                  ? styles.tipoUsuarioButtonActive
                  : styles.tipoUsuarioButtonInactive
              ]}
              onPress={() => setTipoUsuario(USER_TYPES.GUIA_TURISTA)}
              disabled={loading}
            >
              <Text style={[
                styles.tipoUsuarioButtonText,
                tipoUsuario === USER_TYPES.GUIA_TURISTA
                  ? styles.tipoUsuarioButtonTextActive
                  : styles.tipoUsuarioButtonTextInactive
              ]}>
                Guia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Perfil Profissional para Guias */}
        {tipoUsuario === USER_TYPES.GUIA_TURISTA && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome do Perfil Profissional</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color={isDark ? '#B0C4D4' : '#6B7280'} />
              <TextInput
                style={styles.textInput}
                placeholder="Digite o nome do seu perfil profissional"
                placeholderTextColor={isDark ? '#B0C4D4' : '#9CA3AF'}
                value={perfilProfissional}
                onChangeText={setPerfilProfissional}
                editable={!loading}
              />
            </View>
          </View>
        )}

        {/* Upload de Documentos */}
        {(tipoUsuario === USER_TYPES.TURISTA || tipoUsuario === USER_TYPES.GUIA_TURISTA) && (
          <View style={styles.documentosContainer}>
            <Text style={styles.documentosLabel}>Documentos</Text>

            {/* Documentos adicionados */}
            {documentos.map((doc, index) => (
              <View key={index} style={styles.documentoItem}>
                <View style={styles.documentoInfo}>
                  <Text style={styles.documentoName}>{doc.arquivo.name}</Text>
                  <Text style={styles.documentoType}>{doc.tipo_documento}</Text>
                </View>
                <TouchableOpacity
                  style={styles.documentoRemove}
                  onPress={() => removeDocument(doc.tipo_documento)}
                  disabled={loading}
                >
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Botões para adicionar documentos */}
            {getRequiredDocuments().map((doc) => {
              const isAdded = documentos.some(d => d.tipo_documento === doc.tipo);
              return (
                <TouchableOpacity
                  key={doc.tipo}
                  style={styles.addDocumentButton}
                  onPress={() => pickDocument(doc.tipo)}
                  disabled={loading || isAdded}
                >
                  <Ionicons
                    name={isAdded ? "checkmark-circle" : "add-circle-outline"}
                    size={20}
                    color={isAdded ? "#10B981" : (isDark ? '#B0C4D4' : '#6B7280')}
                  />
                  <Text style={[styles.addDocumentText, { marginLeft: 8 }]}>
                    {isAdded ? `${doc.label} (Adicionado)` : `Adicionar ${doc.label}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Senha</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#B0C4D4' : '#6B7280'} />
            <TextInput
              style={styles.textInput}
              placeholder="Digite sua senha"
              placeholderTextColor={isDark ? '#B0C4D4' : '#9CA3AF'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? '#B0C4D4' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirmar senha</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color={isDark ? '#B0C4D4' : '#6B7280'} />
            <TextInput
              style={styles.textInput}
              placeholder="Confirme sua senha"
              placeholderTextColor={isDark ? '#B0C4D4' : '#9CA3AF'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={20}
                color={isDark ? '#B0C4D4' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
            disabled={loading}
          >
            {acceptedTerms && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Concordo com os{' '}
            <Text style={styles.termsLink}>Termos de Uso</Text> e{' '}
            <Text style={styles.termsLink}>Política de Privacidade</Text>
          </Text>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={!acceptedTerms || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={styles.socialButtonText}>Continuar com Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Ionicons name="logo-apple" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
          <Text style={styles.socialButtonText}>Continuar com Apple</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
