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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { lessonsApi } from '../../services/api';
import { Lesson, Module } from '../../types';
import { StudentStackParams } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<StudentStackParams, 'LessonDetail'>;
  route: RouteProp<StudentStackParams, 'LessonDetail'>;
};

const STATUS_COLOR: Record<string, string> = {
  approved: '#22c55e',
  pending: '#f59e0b',
  rejected: '#ef4444',
};

export default function LessonDetailScreen({ navigation, route }: Props) {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lessonsApi.get(lessonId)
      .then(setLesson)
      .catch((e) => Alert.alert('Erro', e.message))
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  const approved = lesson?.modules.filter(m => m.status === 'approved') ?? [];

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>{lesson?.title}</Text>
          <Text style={styles.meta}>{lesson?.sourceFileName} · {approved.length} módulos disponíveis</Text>

          {/* Chat button */}
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate('Chat', {
              lessonId: lessonId,
              title: lesson?.title ?? '',
            })}
          >
            <Text style={styles.chatBtnText}>💬 Conversar com a Nara</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Módulos</Text>
        </>
      }
      data={approved}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={styles.moduleCard}
          onPress={() => navigation.navigate('Chat', {
            lessonId: lessonId,
            moduleId: item.id,
            title: item.title,
          })}
          activeOpacity={0.8}
        >
          <View style={styles.moduleHeader}>
            <View style={styles.moduleNumber}>
              <Text style={styles.moduleNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.moduleInfo}>
              <Text style={styles.moduleTitle}>{item.title}</Text>
              <Text style={styles.moduleSummary} numberOfLines={2}>{item.summary}</Text>
            </View>
          </View>
          {item.concepts.length > 0 && (
            <View style={styles.tagsRow}>
              {item.concepts.slice(0, 3).map((c) => (
                <View key={c} style={styles.tag}>
                  <Text style={styles.tagText}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhum módulo aprovado nesta aula ainda.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, paddingTop: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', marginBottom: 6 },
  meta: { fontSize: 13, color: '#64748b', marginBottom: 20 },
  chatBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 28,
  },
  chatBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  moduleCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  moduleHeader: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  moduleNumber: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#312e81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleNumberText: { color: '#a5b4fc', fontWeight: '800', fontSize: 15 },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginBottom: 4 },
  moduleSummary: { fontSize: 13, color: '#94a3b8', lineHeight: 18 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: '#0f172a', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, color: '#6366f1', fontWeight: '600' },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 14 },
});
