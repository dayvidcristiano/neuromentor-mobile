import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { lessonsApi } from '../../services/api';
import { Lesson, Module } from '../../types';
import { TeacherStackParams } from '../../navigation/types';

type Props = {
  route: RouteProp<TeacherStackParams, 'ReviewLesson'>;
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovado',
  rejected: 'Rejeitado',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
};

export default function ReviewLessonScreen({ route }: Props) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    lessonsApi.get(lessonId)
      .then(setLesson)
      .catch((e) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lessonId]);

  const setStatus = async (moduleId: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    setUpdating(moduleId);
    try {
      await lessonsApi.setModuleStatus(lessonId, moduleId, status);
      setLesson((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId ? { ...m, status: status.toLowerCase() as any } : m
          ),
        };
      });
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setUpdating(null);
    }
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
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{lesson?.title}</Text>
          <Text style={styles.meta}>
            {lesson?.modules.filter(m => m.status === 'approved').length} aprovados ·{' '}
            {lesson?.modules.filter(m => m.status === 'pending').length} pendentes
          </Text>
          <Text style={styles.sectionTitle}>Módulos para revisão</Text>
        </>
      }
      data={lesson?.modules ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.moduleCard}>
          <View style={styles.moduleHeader}>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
              <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
          </View>

          <Text style={styles.moduleTitle}>{item.title}</Text>
          <Text style={styles.moduleSummary}>{item.summary}</Text>

          {item.concepts.length > 0 && (
            <View style={styles.tagsRow}>
              {item.concepts.map((c) => (
                <View key={c} style={styles.tag}>
                  <Text style={styles.tagText}>{c}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Actions */}
          {item.status !== 'approved' && (
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => setStatus(item.id, 'Approved')}
              disabled={updating === item.id}
            >
              {updating === item.id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.approveBtnText}>Aprovar</Text>
              )}
            </TouchableOpacity>
          )}
          {item.status !== 'rejected' && (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => setStatus(item.id, 'Rejected')}
              disabled={updating === item.id}
            >
              <Text style={styles.rejectBtnText}>Rejeitar</Text>
            </TouchableOpacity>
          )}
          {item.status !== 'pending' && (
            <TouchableOpacity
              style={styles.pendingBtn}
              onPress={() => setStatus(item.id, 'Pending')}
              disabled={updating === item.id}
            >
              <Text style={styles.pendingBtnText}>Voltar a pendente</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 4 },
  meta: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  moduleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  moduleHeader: { flexDirection: 'row', justifyContent: 'flex-end' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },
  moduleTitle: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  moduleSummary: { fontSize: 13, color: '#94a3b8', lineHeight: 19 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#0f172a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#6366f1', fontWeight: '600' },
  approveBtn: { backgroundColor: '#15803d', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  approveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  rejectBtn: { backgroundColor: '#7f1d1d', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  rejectBtnText: { color: '#fca5a5', fontWeight: '700', fontSize: 14 },
  pendingBtn: { borderRadius: 10, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  pendingBtnText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
});
