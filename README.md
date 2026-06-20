# NeuroMentor Mobile

Aplicação mobile do **NeuroMentor** - plataforma EdTech que transforma materiais didáticos em experiências de aprendizagem personalizadas com apoio de Inteligência Artificial.

> Desenvolvido como projeto da disciplina de Desenvolvimento Mobile - Porto Digital / Cesar School.

---

## Sobre o Projeto

O NeuroMentor resolve dois problemas centrais da educação:

- **Para o professor:** dificuldade em estruturar e distribuir conteúdos didáticos de forma eficiente
- **Para o aluno:** falta de suporte contextualizado fora da sala de aula

A plataforma permite que professores façam upload de materiais (PDF, DOCX, PPTX), a IA gera módulos pedagógicos automaticamente, e os alunos interagem com a mentora **Nara** para tirar dúvidas e estudar de forma personalizada.

---

## Tecnologias

- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/) SDK 54
- [TypeScript](https://www.typescriptlang.org/)
- [React Navigation](https://reactnavigation.org/) - navegação por stacks com guard de autenticação
- [Zustand](https://zustand-demo.pmnd.rs/) - gerenciamento de estado global
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - persistência de sessão JWT

---

## Pré-requisitos

- Node.js 18+
- Expo Go instalado no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))
- Backend [NeuroMentor Backend](https://github.com/dayvidcristiano/neuromentor-back) rodando localmente

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/dayvidcristiano/neuromentor-mobile.git
cd neuromentor-mobile

# Instale as dependências
npm install --legacy-peer-deps
```

### Configuração da API

Abra `src/services/api.ts` e ajuste o `API_BASE_URL`:

```ts
// Navegador (--web)
export const API_BASE_URL = 'http://localhost:5176';

// Celular (Expo Go) — use o IP da sua máquina
// export const API_BASE_URL = 'http://192.168.x.x:5176';
```

---

## Rodando o projeto

```bash
# Inicia o Metro Bundler
npx expo start

# Abre direto no navegador
npx expo start --web
```

Escaneie o QR code com o Expo Go para abrir no celular.

---

## Estrutura de Pastas

```
src/
├── screens/
│   ├── auth/          # Login e Cadastro
│   ├── student/       # Home, Aulas, Chat com Nara, Entrar em Turma
│   └── teacher/       # Home, Upload, Revisão de Módulos, Turmas
├── navigation/        # Stacks de navegação por perfil (auth/aluno/professor)
├── services/          # Integração com a API (auth, aulas, turmas, chat)
├── stores/            # Estado global com Zustand (autenticação)
└── types/             # Interfaces TypeScript do domínio
```

---

## Fluxos Principais

**Professor**
1. Cadastro com perfil de professor
2. Upload de material (PDF/DOCX/PPTX)
3. IA gera módulos pedagógicos automaticamente
4. Professor revisa e aprova cada módulo
5. Cria turmas e compartilha código com alunos

**Aluno**
1. Cadastro com perfil de aluno
2. Entra em turma pelo código
3. Acessa aulas disponibilizadas pelo professor
4. Interage com a mentora IA **Nara** para estudar

---

## Backend

Este app consome a API [NeuroMentor Backend](https://github.com/dayvidcristiano/neuromentor-back), desenvolvida em **ASP.NET Core** com:

- Autenticação JWT
- PostgreSQL
- Integração com Gemini AI (Google)
- Extração de texto de PDF, DOCX e PPTX

---

## Milestones

| Data | Entrega |
|------|---------|
| 29/05/2026 | Base do app + arquitetura funcional |
| 05/06/2026 | Fluxo principal funcionando com integração real ao backend e IA |
| 19/06/2026 | Entrega final + apresentação |

---
## APK (Release)

O APK de produção do aplicativo foi gerado via EAS Build e está disponível em:

https://expo.dev/accounts/dayvidcristiano/projects/neuromentor-mobile/builds/423730f5-1181-40df-abfe-7d34902b05bc

### Como gerar um novo build

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```
O processo compila o projeto na nuvem da Expo e gera um link de download do APK ao final.

## Autor

**Dayvid Cristiano**  
Projeto desenvolvido para a disciplina de Desenvolvimento Mobile - Porto Digital / Cesar School
