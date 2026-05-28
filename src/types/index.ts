export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  matricula?: string;
  subject?: string;
  isAiEnabled: boolean;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  matricula?: string;
  subject?: string;
  isAiEnabled: boolean;
  isAdmin: boolean;
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  concepts: string[];
  matchScore: number;
  status: 'pending' | 'approved' | 'rejected';
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  sourceFileName: string;
  createdAt: string;
  modules: Module[];
}

export interface ClassStudent {
  userId: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface ClassLesson {
  lessonId: string;
  title: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  createdAt: string;
  lessons: ClassLesson[];
  students: ClassStudent[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
