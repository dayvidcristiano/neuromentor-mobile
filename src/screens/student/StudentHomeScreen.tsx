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
import { StudentStackParams } from '../../navigation/types';

type Props = { navigation: NativeStackNavigationProp<StudentStackParams, 'StudentHome'> };

export default function StudentHomeScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [l, c] = await Promise.all([lessonsApi.available(), classesApi.myClasses()]);
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
                <Text style={styles.greeting}>Ola, {user?.name?.split(' ')[0]}</Text>
                <Text style={styles.role}>Aluno</Text>
              </View>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="flash-outline" size={22} color="#8b5cf6" />
            </View>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Sua jornada de aprendizado</Text>
              <Text style={styles.bannerSub}>Complete modulos para evoluir com a Nara</Text>
            </View>
          </View>

          {/* Turmas */}
          <Text style={styles.sectionTitle}>Minhas Turmas</Text>
          {classes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={28} color="#374151" />
              <Text style={styles.emptyText}>Voce nao esta em nenhuma turma ainda.</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => navigation.navigate('JoinClass')}
              >
                <Ionicons name="add-outline" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Entrar em uma turma</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {classes.map((c) => (
                <View key={c.id} style={styles.classCard}>
                  <View style={styles.classIcon}>
                    <Ionicons name="school-outline" size={18} color="#8b5cf6" />
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={styles.className}>{c.name}</Text>
                    <Text style={styles.classMeta}>Prof. {c.teacherName} · {c.lessons.length} aulas</Text>
                  </View>
                </View>
              ))}
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('JoinClass')}
              >
                <Ionicons name="add-outline" size={16} color="#8b5cf6" />
                <Text style={styles.secondaryBtnText}>Entrar em outra turma</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Aulas Disponiveis</Text>
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
            <Ionicons name="book-outline" size={20} color="#8b5cf6" />
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{item.title}</Text>
            <Text style={styles.lessonMeta}>
              {item.modules.filter(m => m.status === 'approved').length} modulos · {item.sourceFileName}
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color="#374151" />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Ionicons name="book-outline" size={28} color="#374151" />
          <Text style={styles.emptyText}>Nenhuma aula disponivel ainda.</Text>
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
  banner: {
    backgroundColor: 'rgba(124,58,237,0.1)',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.25)',
  },
  bannerIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(124,58,237,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: '600', color: '#c4b5fd' },
  bannerSub: { fontSize: 12, color: '#7c3aed', marginTop: 2 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  classCard: {
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
  classIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(124,58,237,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classInfo: { flex: 1 },
  className: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  classMeta: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  emptyCard: {
    backgroundColor: '#13152b',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderStyle: 'dashed',
  },
  emptyText: { color: '#6b7280', fontSize: 13 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  actionBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginTop: 4,
  },
  secondaryBtnText: { color: '#8b5cf6', fontWeight: '600', fontSize: 13 },
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
});