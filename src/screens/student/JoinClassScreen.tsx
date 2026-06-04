import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { classesApi } from '../../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StudentStackParams } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<StudentStackParams, 'JoinClass'>;
};

export default function JoinClassScreen({ navigation }: Props) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (code.trim().length < 4) {
      Alert.alert('Atenção', 'Digite o código da turma.');
      return;
    }
    setLoading(true);
    try {
      const cls = await classesApi.join(code.trim().toUpperCase());
      Alert.alert('Turma acessada!', `Bem-vindo(a) à turma "${cls.name}"!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Entrar em uma turma</Text>
        <Text style={styles.subtitle}>
          Peça o código de 6 caracteres ao seu professor
        </Text>

        <TextInput
          style={styles.codeInput}
          placeholder="Ex: ABC123"
          placeholderTextColor="#475569"
          value={code}
          onChangeText={(t) => setCode(t.toUpperCase())}
          autoCapitalize="characters"
          maxLength={6}
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.btn, (loading || code.length < 4) && styles.btnDisabled]}
          onPress={handleJoin}
          disabled={loading || code.length < 4}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Entrar na turma</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20 },
  codeInput: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    color: '#f1f5f9',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    letterSpacing: 6,
    fontWeight: '800',
    marginTop: 8,
  },
  btn: {
    width: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
