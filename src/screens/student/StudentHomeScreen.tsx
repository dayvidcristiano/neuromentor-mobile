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
import { StudentStackParams } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<StudentStackParams, 'StudentHome'> };

export default function StudentHomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const load = async () => {
    try {
      const [l, c] = await Promise.all([
        lessonsApi.available(),
        classesApi.myClasses(),
      ]);
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

  const handleJoin = async (code: string) => {
    if (!code.trim()) return;
    try {
      await classesApi.join(code.trim().toUpperCase());
      Alert.alert('Sucesso', 'Você entrou na turma!');
      load();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#6366f1" />}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
              <Text style={styles.role}>Aluno</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>

          {/* XP Card */}
          <View style={styles.xpCard}>
                                                                                                                                                                                                                                                                                                                                                       <View>
              <Text style={styles.xpTitle}>Sua jornada de aprendizado</Text>
              <Text style={styles.xpSub}>Complete módulos para ganhar XP</Text>
            </View>
          </View>

          {/* Turmas */}
          <Text style={styles.sectionTitle}>Minhas Turmas</Text>
          {classes.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Você não está em nenhuma turma ainda.</Text>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => navigation.navigate('JoinClass')}
              >
                <Text style={styles.joinButtonText}>+ Entrar em uma turma</Text>
              </TouchableOpacity>
            </View>
          )}
          {classes.map((c) => (
            <View key={c.id} style={styles.classCard}>
              <Text style={styles.className}>{c.name}</Text>
              <Text style={styles.classInfo}>Prof. {c.teacherName} · {c.lessons.length} aulas</Text>
            </View>
          ))}
          {classes.length > 0 && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('JoinClass')}
            >
              <Text style={styles.secondaryBtnText}>+ Entrar em outra turma</Text>
            </TouchableOpacity>
          )}

          {/* Aulas disponíveis */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Aulas Disponíveis</Text>
        </>
      }
      data={lessons}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.lessonCard}
          onPress={() => navigation.navigate('LessonDetail', { lessonId: item.id, title: item.title })}
          activeOpacity={0.8}
        >
          <View style={styles.lessonIcon}>
            <Text style={{ fontSize: 22 }}>📚</Text>
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonMeta}>
              {item.modules.filter(m => m.status === 'approved').length} módulos · {item.sourceFileName}
            </Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Nenhuma aula disponível ainda.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  role: { fontSize: 13, color: '#64748b', marginTop: 2 },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1e293b' },
  logoutText: { color: '#f87171', fontSize: 13, fontWeight: '600' },
  xpCard: {
    backgroundColor: '#1e1b4b',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#312e81',
  },
  xpEmoji: { fontSize: 32 },
  xpTitle: { fontSize: 15, fontWeight: '700', color: '#c7d2fe' },
  xpSub: { fontSize: 12, color: '#818cf8', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#94a3b8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  classCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  className: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  classInfo: { fontSize: 12, color: '#64748b', marginTop: 4 },
  emptyCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
  },
  emptyText: { color: '#64748b', fontSize: 14 },
  joinButton: {
    marginTop: 12,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  joinButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 6,
  },
  secondaryBtnText: { color: '#818cf8', fontWeight: '600', fontSize: 14 },
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
  arrow: { fontSize: 22, color: '#334155', fontWeight: '300' },
});
