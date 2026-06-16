# MVP Checklist — Meu Bicho de Volta

> Última atualização: 2026-06-16 (sessão 2)  
> Legenda: ✅ Feito · 🔄 Em andamento · ⬜ Pendente · 🔒 Bloqueado (depende de outro)

---

## 1. BACKEND (NestJS)

### 1.1 Infraestrutura base
- ✅ Docker Compose (PostgreSQL 15 + PostGIS 3.3 + Redis 7)
- ✅ TypeORM configurado (synchronize:true em dev)
- ✅ ConfigModule (database, redis, jwt)
- ✅ main.ts com ValidationPipe, AllExceptionsFilter, CORS
- ✅ Enums globais (UserRole, CaseStatus, AnimalType, etc.)
- ✅ Guards (JwtAuthGuard, RolesGuard)
- ✅ Decorators (@CurrentUser, @Roles)

### 1.2 Entidades (banco de dados)
- ✅ User, UserDevice, UserLocation
- ✅ Pet, PetPhoto
- ✅ LostPetCase, CaseTimelineEvent, SightingReport
- ✅ Notification
- ✅ Conversation, Message
- ✅ Report (moderação)

### 1.3 Módulos implementados
- ✅ AuthModule — register, login, refresh-token, GET /me
- ✅ UsersModule — perfil, localização, devices
- ✅ GeoModule — PostGIS ST_DWithin (raio por usuários e casos)
- ✅ PetsModule — CRUD + fotos
- ✅ LostCasesModule — CRUD + avistamentos + timeline + disparo de alertas
- ✅ NotificationsModule — Bull queue + FCM placeholder + notifyUsersNearby
- ✅ MessagingModule — chat por caso + notificação ao receber mensagem
- ✅ MediaModule — upload Cloudflare R2 (com fallback local dev) + compressão WebP via sharp

### 1.4 Módulos pendentes
- ✅ **[P1] MediaModule** — upload de imagens para Cloudflare R2 *(concluído)*
- 🔄 **[P1] FCM real** — integrar Firebase Admin SDK no NotificationsProcessor
  - Instalar `firebase-admin`
  - Configurar `FIREBASE_SERVICE_ACCOUNT_JSON` no .env
  - Substituir o `logger.log` por `admin.messaging().sendEachForMulticast()`
  - Tratar tokens inválidos (remover do banco)
- ⬜ **[P2] ModerationModule** — denúncias de casos/usuários
  - `POST /api/v1/reports` — criar denúncia
  - `GET /api/v1/reports` — listar (admin only)
  - `PATCH /api/v1/reports/:id` — resolver (admin only)
- ⬜ **[P2] Auth — recuperação de senha**
  - `POST /api/v1/auth/forgot-password` — envia e-mail com token
  - `POST /api/v1/auth/reset-password` — troca senha com token
  - Integração com Resend (e-mail transacional) ou SendGrid
- ⬜ **[P2] Auth — verificação de e-mail**
  - Enviar link de verificação após registro
  - `GET /api/v1/auth/verify-email?token=` — ativar conta
- ⬜ **[P3] AdminModule** — painel básico
  - `GET /api/v1/admin/stats` — métricas (casos, usuários, avistamentos)
  - `GET /api/v1/admin/cases` — listar todos os casos (com filtros)
  - `PATCH /api/v1/admin/cases/:id/status` — aprovar/rejeitar/remover
  - `GET /api/v1/admin/users` — listar usuários
  - `PATCH /api/v1/admin/users/:id/status` — bloquear/desbloquear
- ⬜ **[P3] Job de expiração de casos**
  - Bull Cron job que roda diariamente
  - Casos com `expiresAt < now` e status ACTIVE → EXPIRED
  - Notifica o dono 7 dias antes de expirar
- ⬜ **[P3] Página pública do caso** (sem autenticação)
  - `GET /api/v1/public/cases/:id` — retorna dados públicos do caso
  - Para compartilhamento via WhatsApp/redes sociais

---

## 2. INFRAESTRUTURA

- ⬜ **[P1] Cloudflare R2**
  - Criar conta Cloudflare
  - Criar bucket `mbv-media`
  - Gerar Access Key + Secret Key
  - Configurar domínio público para o bucket (ex: media.meubichodevolta.com.br)
  - Adicionar variáveis no .env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`
- ⬜ **[P1] Firebase — FCM**
  - Criar projeto no Firebase Console
  - Ativar Cloud Messaging
  - Baixar `serviceAccountKey.json`
  - Adicionar `FIREBASE_SERVICE_ACCOUNT_JSON` no .env de produção
- ⬜ **[P2] Hetzner VPS**
  - Criar conta Hetzner
  - Provisionar VPS CX22 (2 vCPU, 4GB RAM, ~€4.50/mo)
  - Instalar Docker + Docker Compose no servidor
  - Configurar Nginx como reverse proxy (porta 80/443 → 3000)
  - SSL via Cloudflare (proxy + certificado)
- ⬜ **[P2] Domínio e DNS**
  - Registrar domínio (ex: meubichodevolta.com.br)
  - Configurar DNS no Cloudflare
  - Subdomínios: `api.`, `admin.`, `media.`
- ⬜ **[P2] Variáveis de ambiente de produção**
  - Criar `.env.production` com secrets reais
  - JWT secrets fortes (256 bits)
  - Configurar segredos no GitHub Actions
- ⬜ **[P3] CI/CD — GitHub Actions**
  - Workflow: push para `main` → build → SSH deploy no Hetzner
  - `docker compose up -d --build` no servidor
  - Notificação de deploy (Slack/Discord opcional)

---

## 3. MOBILE (Flutter)

### 3.1 Estrutura base
- ✅ Projeto criado (`apps/mobile/` · `br.com.meubichodevolta`)
- ⬜ **[P1] Dependências e arquitetura**
  - Adicionar pacotes: `dio`, `flutter_secure_storage`, `go_router`, `provider` ou `riverpod`, `google_maps_flutter`, `geolocator`, `image_picker`, `firebase_messaging`, `cached_network_image`
  - Estrutura de pastas: `lib/core/`, `lib/features/`, `lib/shared/`
  - HTTP client com interceptor de JWT (refresh automático)
  - Armazenamento seguro dos tokens

### 3.2 Telas de autenticação
- ⬜ **[P1]** Tela de boas-vindas (splash + onboarding)
- ⬜ **[P1]** Tela de login (e-mail + senha)
- ⬜ **[P1]** Tela de cadastro (nome, e-mail, senha, cidade, aceite de termos)
- ⬜ **[P2]** Tela de recuperação de senha
- ⬜ **[P3]** Login com Google (Google Sign-In)

### 3.3 Cadastro de pet
- ⬜ **[P1]** Tela "Meus Pets" (lista + botão adicionar)
- ⬜ **[P1]** Formulário de cadastro de pet (nome, tipo, raça, cor, porte, sexo, fotos)
- ⬜ **[P1]** Upload de foto do pet via R2
- ⬜ **[P2]** Edição e exclusão de pet

### 3.4 Caso perdido — tutor
- ⬜ **[P1]** Fluxo de cadastro de caso perdido
  - Selecionar pet cadastrado
  - Marcar local no mapa onde foi visto pela última vez
  - Data/hora, descrição, raio de busca
  - Preview e confirmação
- ⬜ **[P1]** Tela de detalhe do caso (próprio) — timeline, avistamentos, status
- ⬜ **[P2]** Editar / encerrar caso (marcar como encontrado)
- ⬜ **[P2]** Compartilhar caso (link público via WhatsApp)

### 3.5 Feed e mapa
- ⬜ **[P1]** Tela principal — feed de casos próximos (lista com filtros)
- ⬜ **[P1]** Mapa com pins dos casos próximos (Google Maps)
- ⬜ **[P1]** Tela de detalhe do caso (como colaborador)
- ⬜ **[P1]** Formulário de avistamento (foto, localização, grau de certeza, comentário)
- ⬜ **[P2]** Filtros: tipo de animal, raio, data

### 3.6 Notificações
- ⬜ **[P1]** Configuração do Firebase Messaging no Flutter
- ⬜ **[P1]** Permissão de notificação push (Android + iOS)
- ⬜ **[P1]** Registro do `pushToken` no backend ao login
- ⬜ **[P1]** Tela de notificações internas (lista, marcar lida)
- ⬜ **[P2]** Deep link ao tocar na notificação → abre o caso correspondente

### 3.7 Geolocalização
- ⬜ **[P1]** Solicitar permissão de localização
- ⬜ **[P1]** Enviar localização atual ao backend (`POST /users/me/location`)
- ⬜ **[P2]** Atualização periódica de localização em background

### 3.8 Chat / Mensagens
- ⬜ **[P2]** Tela de conversas (lista)
- ⬜ **[P2]** Tela de chat (bolhas, input, envio)
- ⬜ **[P2]** Badge de mensagens não lidas

### 3.9 Perfil
- ⬜ **[P2]** Tela de perfil (editar nome, telefone, foto)
- ⬜ **[P2]** Upload de foto de perfil via R2
- ⬜ **[P3]** Configurações de notificação (ativar/desativar push)
- ⬜ **[P3]** Logout e exclusão de conta

---

## 4. ADMIN WEB (React + Vite)

- ⬜ **[P2]** Setup do projeto (`apps/admin/` · Vite + React + TypeScript + Tailwind)
- ⬜ **[P2]** Tela de login (admin only)
- ⬜ **[P2]** Dashboard — métricas: casos ativos, resolvidos, usuários, avistamentos
- ⬜ **[P3]** Listagem e moderação de casos (aprovar, rejeitar, remover, destacar)
- ⬜ **[P3]** Listagem e gestão de usuários (bloquear, desbloquear)
- ⬜ **[P3]** Listagem de denúncias e resolução
- ⬜ **[P3]** Deploy no Vercel (free tier)

---

## Resumo de prioridades

| Prioridade | O que fazer | Por quê |
|---|---|---|
| **P1** | MediaModule (R2 upload) | Pet e caso sem foto não funcionam no mobile |
| **P1** | FCM real | Push não chega sem isso |
| **P1** | Cloudflare R2 (conta + bucket) | Bloqueio para MediaModule |
| **P1** | Firebase FCM (conta + chave) | Bloqueio para push real |
| **P1** | Flutter: deps + arquitetura + auth | Base de tudo no mobile |
| **P1** | Flutter: cadastro de pet + foto | Fluxo principal |
| **P1** | Flutter: criar caso + mapa | Core do produto |
| **P1** | Flutter: feed + avistamento | Core do produto |
| **P1** | Flutter: push notifications | Diferencial principal |
| **P2** | Recuperação de senha | Necessário antes de lançar |
| **P2** | Hetzner VPS + DNS + SSL | Deploy de produção |
| **P2** | Flutter: chat | MVP funcional |
| **P2** | Admin Web básico | Moderação mínima |
| **P3** | Job de expiração de casos | Qualidade |
| **P3** | Página pública do caso | Compartilhamento |
| **P3** | Login com Google | Conveniência |
| **P3** | Admin Web completo | Gestão avançada |
