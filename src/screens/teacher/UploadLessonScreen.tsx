import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { lessonsApi } from '../../services/api';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TeacherStackParams } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<TeacherStackParams, 'UploadLesson'>;
};

export default function UploadLessonScreen({ navigation }: Props) {
  const [file, setFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'pick' | 'generating' | 'done'>('pick');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;
      const asset = result.assets[0];
      setFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setStep('generating');

    try {
      // 1. Upload e extração de texto
      const uploaded = await lessonsApi.upload(file);

      // 2. Gerar módulos com IA
      await lessonsApi.generate(uploaded.id, uploaded.title, uploaded.extractedText);

      setStep('done');
      Alert.alert(
        '✅ Aula criada!',
        'Os módulos foram gerados. Acesse a aula para revisar e aprovar cada módulo.',
        [{ text: 'Ver aulas', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      setStep('pick');
      Alert.alert('Erro no upload', e.message ?? 'Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Enviar Material</Text>
      <Text style={styles.subtitle}>
        Faça upload de um PDF, DOCX ou PPTX. A IA irá extrair o conteúdo e gerar módulos pedagógicos automaticamente.
      </Text>

      {/* File picker */}
      <TouchableOpacity style={styles.pickArea} onPress={pickFile} disabled={loading}>
        <Text style={styles.pickIcon}>{file ? '📄' : '📁'}</Text>
        {file ? (
          <>
            <Text style={styles.fileName}>{file.name}</Text>
            <Text style={styles.changeFile}>Toque para trocar</Text>
          </>
        ) : (
          <>
            <Text style={styles.pickText}>Selecionar arquivo</Text>
            <Text style={styles.pickFormats}>PDF · DOCX · PPTX</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Steps indicator */}
      <View style={styles.steps}>
        <StepItem num={1} label="Upload do arquivo" active={!!file} done={step !== 'pick'} />
        <View style={styles.stepLine} />
        <StepItem num={2} label="Extração de texto" active={step === 'generating'} done={step === 'done'} />
        <View style={styles.stepLine} />
        <StepItem num={3} label="Geração de módulos com IA" active={step === 'generating'} done={step === 'done'} />
      </View>

      <TouchableOpacity
        style={[styles.uploadBtn, (!file || loading) && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={!file || loading}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.uploadBtnText}>Processando...</Text>
          </View>
        ) : (
          <Text style={styles.uploadBtnText}>🚀 Enviar e Gerar Módulos</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

function StepItem({ num, label, active, done }: { num: number; label: string; active: boolean; done: boolean }) {
  return (
    <View style={stepStyles.row}>
      <View style={[stepStyles.circle, done && stepStyles.circleDone, active && stepStyles.circleActive]}>
        <Text style={stepStyles.circleText}>{done ? '✓' : num}</Text>
      </View>
      <Text style={[stepStyles.label, (active || done) && stepStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const stepStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', justifyContent: 'center', alignItems: 'center' },
  circleActive: { borderColor: '#6366f1' },
  circleDone: { backgroundColor: '#22c55e', borderColor: '#22c55e' },
  circleText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  label: { fontSize: 13, color: '#475569' },
  labelActive: { color: '#94a3b8' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 24, gap: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  subtitle: { fontSize: 14, color: '#64748b', lineHeight: 21 },
  pickArea: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#334155',
  },
  pickIcon: { fontSize: 40 },
  pickText: { fontSize: 16, fontWeight: '700', color: '#94a3b8' },
  pickFormats: { fontSize: 12, color: '#475569' },
  fileName: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', textAlign: 'center' },
  changeFile: { fontSize: 12, color: '#6366f1' },
  steps: { backgroundColor: '#1e293b', borderRadius: 14, padding: 18, gap: 12, borderWidth: 1, borderColor: '#334155' },
  stepLine: { width: 2, height: 12, backgroundColor: '#334155', marginLeft: 13 },
  uploadBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  uploadBtnDisabled: { opacity: 0.4 },
  uploadBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
