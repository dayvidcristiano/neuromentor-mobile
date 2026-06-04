import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { chatApi } from '../../services/api';
import { ChatMessage } from '../../types';
import { StudentStackParams } from '../../navigation/types';
import { useAuthStore } from '../../stores/auth';

type Props = {
  route: RouteProp<StudentStackParams, 'Chat'>;
};

export default function ChatScreen({ route }: Props) {
  const { moduleId, title } = route.params;
  const user = useAuthStore((s) => s.user);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Olá! Sou a **Nara**, sua mentora de IA. Estou aqui para te ajudar com "${title}". O que você quer aprender hoje? 🎓`,
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || streaming) return;
    if (!user?.isAiEnabled) {
      Alert.alert('IA desabilitada', 'Peça ao seu professor para habilitar o acesso à IA.');
      return;
    }

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    // Add placeholder for assistant response
    const assistantIdx = newMessages.length;
    setMessages([...newMessages, { role: 'assistant', content: '' }]);

    try {
      await chatApi.stream(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        moduleId,
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            updated[assistantIdx] = {
              role: 'assistant',
              content: (updated[assistantIdx]?.content ?? '') + chunk,
            };
            return updated;
          });
        }
      );
    } catch (e: any) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: 'assistant',
          content: ' Não consegui responder. Tente novamente.',
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.avatar}>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content || (streaming ? '...' : '')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Pergunte algo sobre o módulo..."
          placeholderTextColor="#475569"
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
          editable={!streaming}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || streaming) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!input.trim() || streaming}
        >
          {streaming ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendIcon}>↑</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  list: { padding: 16, paddingBottom: 8, gap: 12 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 4 },
  msgRowUser: { justifyContent: 'flex-end' },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleAssistant: { backgroundColor: '#1e293b', borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: '#4f46e5', borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: '#e2e8f0', lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#0f172a',
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#f1f5f9',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#334155' },
  sendIcon: { color: '#fff', fontSize: 20, fontWeight: '700' },
});
