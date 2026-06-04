import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../../stores/auth';
import { AuthStackParams } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<AuthStackParams, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'Student' | 'Teacher'>('Student');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
    } catch (e: any) {
      Alert.alert('Erro ao cadastrar', e.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brand}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>NeuroMentor</Text>
        </View>

        {/* Role selector */}
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'Student' && styles.roleBtnActive]}
            onPress={() => setRole('Student')}
          >
            <Text style={[styles.roleText, role === 'Student' && styles.roleTextActive]}>
              👤 Aluno
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'Teacher' && styles.roleBtnActive]}
            onPress={() => setRole('Teacher')}
          >
            <Text style={[styles.roleText, role === 'Teacher' && styles.roleTextActive]}>
              🎓 Professor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#94a3b8"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Criar conta</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>
            Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
    gap: 24,
  },
  brand: { alignItems: 'center', gap: 6 },
  logo: { fontSize: 48 },
  title: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#64748b' },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  roleBtnActive: { backgroundColor: '#312e81', borderColor: '#6366f1' },
  roleText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
  roleTextActive: { color: '#a5b4fc' },
  form: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#94a3b8', marginBottom: 2 },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#64748b', fontSize: 14 },
  linkBold: { color: '#818cf8', fontWeight: '700' },
});
