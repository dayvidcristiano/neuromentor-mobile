import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { classesApi } from '../../services/api';
import { ClassRoom } from '../../types';

export default function ManageClassesScreen() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const data = await classesApi.list();
      setClasses(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createClass = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const created = await classesApi.create(newName.trim());
      setClasses((prev) => [created, ...prev]);
      setNewName('');
      Alert.alert('✅ Turma criada!', `Código: ${created.code}\n\nCompartilhe com seus alunos.`);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteClass = (id: string, name: string) => {
    Alert.alert(
      'Excluir turma',
      `Deseja excluir a turma "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await classesApi.delete(id);
              setClasses((prev) => prev.filter((c) => c.id !== id));
            } catch (e: any) {
              Alert.alert('Erro', e.message);
            }
          },
        },
      ]
    );
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#6366f1" />}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>Gerenciar Turmas</Text>

          {/* Create class */}
          <View style={styles.createCard}>
            <Text style={styles.createLabel}>Nova turma</Text>
            <View style={styles.createRow}>
              <TextInput
                style={styles.input}
                placeholder="Nome da turma"
                placeholderTextColor="#475569"
                value={newName}
                onChangeText={setNewName}
              />
              <TouchableOpacity
                style={[styles.createBtn, (!newName.trim() || creating) && styles.createBtnDisabled]}
                onPress={createClass}
                disabled={!newName.trim() || creating}
              >
                {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.createBtnText}>+</Text>}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Suas turmas ({classes.length})</Text>
        </>
      }
      data={classes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.classCard}>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{item.name}</Text>
            <View style={styles.codeRow}>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.code}</Text>
              </View>
              <Text style={styles.classMeta}>
                {item.students.length} alunos · {item.lessons.length} aulas
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => deleteClass(item.id, item.name)}
          >
            <Text style={styles.deleteText}>🗑</Text>
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhuma turma criada ainda.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  createCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  createLabel: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  createRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#334155',
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  classCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  classInfo: { flex: 1, gap: 8 },
  className: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeBadge: { backgroundColor: '#312e81', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  codeText: { color: '#a5b4fc', fontWeight: '800', fontSize: 14, letterSpacing: 2 },
  classMeta: { fontSize: 12, color: '#64748b' },
  deleteBtn: { padding: 8 },
  deleteText: { fontSize: 20 },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 14 },
});
