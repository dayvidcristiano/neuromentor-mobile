import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { lessonsApi, classesApi } from '../../services/api';
import { useAuthStore } from '../../stores/auth';
import { Lesson, ClassRoom } from '../../types';
import { TeacherStackParams } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<TeacherStackParams, 'TeacherHome'> };

export default function TeacherHomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [l, c] = await Promise.all([lessonsApi.list(), classesApi.list()]);
      setLessons(l);
      setClasses(c);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

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
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Olá, Prof. {user?.name?.split(' ')[0]} 👋</Text>
              <Text style={styles.role}>Professor{user?.subject ? ` · ${user.subject}` : ''}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{lessons.length}</Text>
              <Text style={styles.statLabel}>Aulas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{classes.length}</Text>
              <Text style={styles.statLabel}>Turmas</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>
                {lessons.reduce((acc, l) => acc + l.modules.filter(m => m.status === 'pending').length, 0)}
              </Text>
              <Text style={styles.statLabel}>Revisões</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('UploadLesson')}
            >
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Enviar aula</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.navigate('ManageClasses')}
            >
              <Text style={styles.actionIcon}>🏫</Text>
              <Text style={styles.actionText}>Turmas</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Minhas Aulas</Text>
        </>
      }
      data={lessons}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const pending = item.modules.filter(m => m.status === 'pending').length;
        return (
          <TouchableOpacity
            style={styles.lessonCard}
            onPress={() => navigation.navigate('ReviewLesson', { lessonId: item.id, title: item.title })}
            activeOpacity={0.8}
          >
            <View style={styles.lessonIcon}>
              <Text style={{ fontSize: 22 }}>📄</Text>
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.lessonMeta}>{item.modules.length} módulos · {item.sourceFileName}</Text>
            </View>
            {pending > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pending}</Text>
              </View>
            )}
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyEmoji}>📂</Text>
          <Text style={styles.emptyText}>Nenhuma aula ainda.</Text>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => navigation.navigate('UploadLesson')}
          >
            <Text style={styles.uploadBtnText}>+ Enviar primeiro material</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  role: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1e293b' },
  logoutText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statNum: { fontSize: 28, fontWeight: '900', color: '#818cf8' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: { fontSize: 26 },
  actionText: { fontSize: 12, fontWeight: '700', color: '#94a3b8' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  lessonCard: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  lessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  lessonMeta: { fontSize: 12, color: '#64748b', marginTop: 3 },
  badge: { backgroundColor: '#f59e0b', borderRadius: 10, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#000', fontWeight: '800', fontSize: 11 },
  arrow: { fontSize: 22, color: '#334155', fontWeight: '300' },
  emptyCard: { padding: 32, alignItems: 'center', gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: '#64748b', fontSize: 15 },
  uploadBtn: { backgroundColor: '#6366f1', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12, marginTop: 4 },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
