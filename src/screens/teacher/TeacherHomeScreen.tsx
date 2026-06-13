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
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
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
      <ActivityIndicator size="large" color="#7c3aed" />
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#7c3aed" />}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require('../../../assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.greeting}>Ola, Prof. {user?.name?.split(' ')[0]}</Text>
                <Text style={styles.role}>Professor{user?.subject ? ` · ${user.subject}` : ''}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="#6b7280" />
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
              <Text style={styles.statLabel}>Revisoes</Text>
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('UploadLesson')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="cloud-upload-outline" size={22} color="#8b5cf6" />
              </View>
              <Text style={styles.actionText}>Enviar aula</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('ManageClasses')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={22} color="#8b5cf6" />
              </View>
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
              <Ionicons name="document-text-outline" size={20} color="#8b5cf6" />
            </View>
            <View style={styles.lessonInfo}>
              <Text style={styles.lessonTitle}>{item.title}</Text>
              <Text style={styles.lessonMeta}>{item.modules.length} modulos · {item.sourceFileName}</Text>
            </View>
            {pending > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pending}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward-outline" size={18} color="#374151" />
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Ionicons name="folder-open-outline" size={32} color="#374151" />
          <Text style={styles.emptyText}>Nenhuma aula ainda.</Text>
          <TouchableOpacity
            style={styles.uploadBtn}
            onPress={() => navigation.navigate('UploadLesson')}
          >
            <Ionicons name="add-outline" size={16} color="#fff" />
            <Text style={styles.uploadBtnText}>Enviar primeiro material</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0d1117' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 32, height: 32 },
  greeting: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  role: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  logoutBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1a1d2e',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#13152b',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  statNum: { fontSize: 26, fontWeight: '800', color: '#8b5cf6' },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 2, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  actionCard: {
    flex: 1,
    backgroundColor: '#13152b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: { fontSize: 12, fontWeight: '600', color: '#9ca3af' },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  lessonCard: {
    backgroundColor: '#13152b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  lessonIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  lessonMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  badge: {
    backgroundColor: '#f59e0b',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: { color: '#000', fontWeight: '800', fontSize: 11 },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderStyle: 'dashed',
    backgroundColor: '#13152b',
  },
  emptyText: { color: '#6b7280', fontSize: 14 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  uploadBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});