import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthResponse, Lesson, ClassRoom } from '../types';

export const API_BASE_URL = 'http://192.168.1.12:5176';
const TOKEN_KEY = '@neuromentor:token';

export const saveToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const removeToken = () => AsyncStorage.removeItem(TOKEN_KEY);

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(err.error ?? `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const authApi = {
  login: (email: string, password: string): Promise<AuthResponse> =>
    apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string): Promise<AuthResponse> =>
    apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  me: (): Promise<AuthResponse> => apiFetch('/api/auth/me'),
};

export const lessonsApi = {
  list: (): Promise<Lesson[]> => apiFetch('/api/lessons'),

  available: (): Promise<Lesson[]> => apiFetch('/api/lessons/available'),

  get: (id: string): Promise<Lesson> => apiFetch(`/api/lessons/${id}`),

  upload: async (file: { uri: string; name: string; type: string }): Promise<any> => {
    const token = await getToken();
    const form = new FormData();
    if (file.uri.startsWith('blob:') || file.uri.startsWith('http') || file.uri.startsWith('data:')) {
      const response = await fetch(file.uri);
      const blob = await response.blob();
      form.append('file', blob, file.name);
    } else {
      form.append('file', { uri: file.uri, name: file.name, type: file.type } as any);
    }
    const res = await fetch(`${API_BASE_URL}/api/lessons/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erro no upload' }));
      throw new Error(err.error ?? `Erro ${res.status}`);
    }
    return res.json();
  },

  generate: (lessonId: string, title: string, text: string): Promise<{ modules: any[] }> =>
    apiFetch('/api/lessons/generate', {
      method: 'POST',
      body: JSON.stringify({ lessonId, title, text }),
    }),

  setModuleStatus: (lessonId: string, moduleId: string, status: string): Promise<any> =>
    apiFetch(`/api/lessons/${lessonId}/modules/${moduleId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string): Promise<null> =>
    apiFetch(`/api/lessons/${id}`, { method: 'DELETE' }),
};

export const classesApi = {
  list: (): Promise<ClassRoom[]> => apiFetch('/api/classes'),

  create: (name: string): Promise<ClassRoom> =>
    apiFetch('/api/classes', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  delete: (id: string): Promise<null> =>
    apiFetch(`/api/classes/${id}`, { method: 'DELETE' }),

  addLesson: (classId: string, lessonId: string, title: string): Promise<null> =>
    apiFetch(`/api/classes/${classId}/lessons`, {
      method: 'POST',
      body: JSON.stringify({ lessonId, title }),
    }),

  join: (code: string): Promise<ClassRoom> =>
    apiFetch('/api/classes/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  myClasses: (): Promise<ClassRoom[]> => apiFetch('/api/classes/my'),
};

export const chatApi = {
 stream: async (
  messages: { role: string; content: string }[],
  moduleId?: string,
  onChunk?: (text: string) => void
): Promise<string> => {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, moduleId }),
  });

  if (!res.ok) throw new Error(`Erro ${res.status}`);

  const text = await res.text();
  let full = '';

  const lines = text.split('\n').filter(Boolean);
  for (const line of lines) {
    if (line.startsWith('0:')) {
      try {
        const chunk = JSON.parse(line.slice(2));
        full += chunk;
        onChunk?.(chunk);
      } catch { continue; }
    }
  }

  return full;
},
};