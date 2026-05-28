import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/auth';
import { AuthStackParams, StudentStackParams, TeacherStackParams } from './types';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Student screens
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import LessonDetailScreen from '../screens/student/LessonDetailScreen';
import ChatScreen from '../screens/student/ChatScreen';
import JoinClassScreen from '../screens/student/JoinClassScreen';

// Teacher screens
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import UploadLessonScreen from '../screens/teacher/UploadLessonScreen';
import ReviewLessonScreen from '../screens/teacher/ReviewLessonScreen';
import ManageClassesScreen from '../screens/teacher/ManageClassesScreen';

const AuthStack = createNativeStackNavigator<AuthStackParams>();
const StudentStack = createNativeStackNavigator<StudentStackParams>();
const TeacherStack = createNativeStackNavigator<TeacherStackParams>();

const screenOptions = {
  headerStyle: { backgroundColor: '#0f172a' },
  headerTintColor: '#f1f5f9',
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#0f172a' },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={screenOptions}>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}

function StudentNavigator() {
  return (
    <StudentStack.Navigator screenOptions={screenOptions}>
      <StudentStack.Screen name="StudentHome" component={StudentHomeScreen} options={{ headerShown: false }} />
      <StudentStack.Screen name="LessonDetail" component={LessonDetailScreen} options={({ route }) => ({ title: route.params?.title ?? 'Aula' })} />
      <StudentStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params?.title ?? 'Nara IA' })} />
      <StudentStack.Screen name="JoinClass" component={JoinClassScreen} options={{ title: 'Entrar em Turma' }} />
    </StudentStack.Navigator>
  );
}

function TeacherNavigator() {
  return (
    <TeacherStack.Navigator screenOptions={screenOptions}>
      <TeacherStack.Screen name="TeacherHome" component={TeacherHomeScreen} options={{ headerShown: false }} />
      <TeacherStack.Screen name="UploadLesson" component={UploadLessonScreen} options={{ title: 'Enviar Material' }} />
      <TeacherStack.Screen name="ReviewLesson" component={ReviewLessonScreen} options={({ route }) => ({ title: route.params?.title ?? 'Revisão' })} />
      <TeacherStack.Screen name="ManageClasses" component={ManageClassesScreen} options={{ title: 'Turmas' }} />
    </TeacherStack.Navigator>
  );
}

export default function RootNavigator() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : user?.role === 'teacher' ? (
        <TeacherNavigator />
      ) : (
        <StudentNavigator />
      )}
    </NavigationContainer>
  );
}
