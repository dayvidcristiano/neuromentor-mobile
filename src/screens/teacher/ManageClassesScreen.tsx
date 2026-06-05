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
  Modal,
} from 'react-native';
import { classesApi, lessonsApi } from '../../services/api';
import { ClassRoom, Lesson } from '../../types';

export default function ManageClassesScreen() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [modalClass, setModalClass] = useState<ClassRoom | null>(null);
  const [addingLesson, setAddingLesson] = useState(false);

  const load = async () => {
    try {
      const [c, l] = await Promise.all([classesApi.list(), lessonsApi.list()]);
      setClasses(c);
      setLessons(l);
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
      Alert.alert('Turma criada!', `Codigo: ${created.code}\n\nCompartilhe com seus alunos.`);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteClass = (id: string, name: string) => {
    Alert.alert('Excluir turma', `Deseja excluir a turma "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await classesApi.delete(id);
            setClasses((prev) => prev.filter((c) => c.id !== id));
          } catch (e: any) {
            Alert.alert('Erro', e.message);
          }
        },
      },
    ]);
  };

  const addLesson = async (classId: string, lessonId: string, title: string) => {
    setAddingLesson(true);
    try {
      await classesApi.addLesson(classId, lessonId, title);
      await load();
      setModalClass(null);
      Alert.alert('Aula adicionada!', 'A aula foi vinculada a turma.');
    } catch (e: any) {
      if (e.message?.includes('ja esta')) {
        Alert.alert('Atencao', 'Esta aula ja esta vinculada a essa turma.');
      } else {
        Alert.alert('Erro', e.message);
      }
    } finally {
      setAddingLesson(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#6366f1" />}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Gerenciar Turmas</Text>
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
              {item.lessons.length > 0 && (
                <View style={styles.lessonsList}>
                  {item.lessons.map((l) => (
                    <View key={l.lessonId} style={styles.lessonChip}>
                      <Text style={styles.lessonChipText}>{l.title}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity
                style={styles.addLessonBtn}
                onPress={() => setModalClass(item)}
              >
                <Text style={styles.addLessonBtnText}>+ Vincular aula</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteClass(item.id, item.name)}>
              <Text style={styles.deleteText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma turma criada ainda.</Text>
          </View>
        }
      />

      <Modal visible={!!modalClass} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Vincular aula a turma</Text>
            <Text style={styles.modalSubtitle}>{modalClass?.name}</Text>

            {lessons.filter(l =>
              !modalClass?.lessons.some(cl => cl.lessonId === l.id)
            ).length === 0 ? (
              <Text style={styles.emptyText}>Todas as aulas ja foram vinculadas.</Text>
            ) : (
              lessons
                .filter(l => !modalClass?.lessons.some(cl => cl.lessonId === l.id))
                .map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    style={styles.modalLessonItem}
                    onPress={() => addLesson(modalClass!.id, l.id, l.title)}
                    disabled={addingLesson}
                  >
                    <Text style={styles.modalLessonTitle}>{l.title}</Text>
                    <Text style={styles.modalLessonMeta}>{l.modules.length} modulos</Text>
                  </TouchableOpacity>
                ))
            )}

            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setModalClass(null)}>
              <Text style={styles.modalCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 20 },
  createCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 24, gap: 10, borderWidth: 1, borderColor: '#334155' },
  createLabel: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  createRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#0f172a', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#f1f5f9', borderWidth: 1, borderColor: '#334155' },
  createBtn: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  classCard: { backgroundColor: '#1e293b', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: '#334155' },
  classInfo: { flex: 1, gap: 8 },
  className: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  codeBadge: { backgroundColor: '#312e81', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  codeText: { color: '#a5b4fc', fontWeight: '800', fontSize: 14, letterSpacing: 2 },
  classMeta: { fontSize: 12, color: '#64748b' },
  lessonsList: { gap: 4 },
  lessonChip: { backgroundColor: '#0f172a', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  lessonChipText: { fontSize: 12, color: '#94a3b8' },
  addLessonBtn: { borderRadius: 8, paddingVertical: 8, borderWidth: 1, borderColor: '#6366f1', alignItems: 'center' },
  addLessonBtnText: { color: '#818cf8', fontWeight: '600', fontSize: 13 },
  deleteBtn: { padding: 8 },
  deleteText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#f1f5f9' },
  modalSubtitle: { fontSize: 13, color: '#64748b', marginBottom: 8 },
  modalLessonItem: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, gap: 4, borderWidth: 1, borderColor: '#334155' },
  modalLessonTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  modalLessonMeta: { fontSize: 12, color: '#64748b' },
  modalCloseBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#334155', marginTop: 8 },
  modalCloseBtnText: { color: '#64748b', fontWeight: '600', fontSize: 15 },
});