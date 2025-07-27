# Piattaforma di Coaching Sportivo

Una piattaforma completa per connettere maestri e studenti per lezioni di sport, costruita con Next.js, TypeScript, Prisma, PostgreSQL e Docker.

## 🚀 Stato Attuale del Progetto

### ✅ Completato
- **Infrastruttura Docker**: Setup completo con `docker-compose.yml`
- **Database PostgreSQL**: Configurato e sincronizzato con Prisma
- **Schema Prisma**: Tutte le entità definite (User, MasterProfile, StudentProfile, Appointment, Message, Tag, Automation, Report)
- **Autenticazione NextAuth**: Configurata con Google OAuth e login manuale
- **Sistema di Registrazione**: Flusso completo per MASTER e STUDENT
- **Selezione Ruolo**: Pagina per scegliere tra MASTER e STUDENT
- **Completamento Profilo**: Form dinamici per MASTER e STUDENT
- **Dashboard**: Interfacce complete per maestri e studenti
- **Modifica Profilo**: Funzionalità per aggiornare i dati del profilo
- **Logout**: Funzionalità di logout nelle dashboard
- **Redirect Intelligenti**: Logica di reindirizzamento basata su ruolo e stato profilo
- **API Backend**: Endpoints per gestione utenti e profili
- **Sistema di Prenotazione**: API CRUD per appuntamenti, ricerca maestri, form di prenotazione, gestione stati e conflitti temporali

### 🔄 In Sviluppo
- **Sistema di Messaggistica**: Chat tra maestri e studenti
- **Sistema di Pagamento**: Integrazione Stripe/PayPal
- **Notifiche**: Email e SMS per appuntamenti
- **Calendario**: Integrazione Google Calendar
- **Rating e Recensioni**: Sistema di valutazione
- **Reportistica**: Dashboard di analytics per maestri

### 📋 Roadmap
- **Integrazioni Esterne**: Mailgun, Twilio, Stripe, PayPal, Google Calendar
- **Automazioni**: Notifiche automatiche e gestione cancellazioni
- **Advanced Features**: Rating, recensioni, pagamenti
- **Mobile App**: Applicazione mobile nativa
- **API Pubblica**: API per integrazioni esterne
- **Multi-lingua**: Supporto per più lingue

## 🛠️ Tecnologie

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js v4
- **Infrastructure**: Docker, Docker Compose
- **State Management**: @tanstack/react-query
- **UI Components**: Lucide React, React Hot Toast

## 📁 Struttura del Progetto

```
lesson-app/
├── docker-compose.yml          # Configurazione Docker
├── .env.example               # Template variabili ambiente
├── .env                       # Variabili ambiente (da creare)
├── backend/                   # API Backend
│   ├── prisma/
│   │   ├── schema.prisma     # Schema database
│   │   └── seed.js           # Dati di test
│   ├── pages/api/            # API Routes
│   ├── services/             # Business logic
│   └── lib/                  # Utilities
├── frontend/                  # Next.js App
│   ├── pages/                # Pagine e API routes
│   ├── components/           # React components
│   └── styles/              # CSS e configurazioni
└── prompts/                  # Documentazione sviluppo
    └── Main.md              # Prompt principale
```

## 🚀 Setup Rapido

### Prerequisiti
- Docker e Docker Compose
- Git

### Installazione Locale

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd lesson-app
   ```

2. **Configura le variabili ambiente**
   ```bash
   cp env.example .env
   # Modifica .env con le tue credenziali
   ```

3. **Avvia i container**
   ```bash
   docker-compose up -d
   ```

4. **Inizializza il database**
   ```bash
   docker-compose exec backend npx prisma db push
   docker-compose exec backend node prisma/seed.js
   ```

5. **Accedi all'applicazione**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001

## 🌐 Deploy su Render

### Prerequisiti
- Account su [Render.com](https://render.com)
- Repository su GitHub

### Setup Render

1. **Prepara il repository**
   ```bash
   git add .
   git commit -m "Ready for Render deployment"
   git push origin main
   ```

2. **Crea un nuovo Web Service su Render**
   - Vai su [render.com](https://render.com)
   - Clicca "New" → "Web Service"
   - Connetti il tuo repository GitHub

3. **Configura il servizio**
   - **Name**: `lesson-app` (o il nome che preferisci)
   - **Environment**: `Docker`
   - **Branch**: `main`
   - **Root Directory**: `/frontend` (dove c'è il Dockerfile)
   - **Build Command**: `docker-compose up --build -d`
   - **Start Command**: `docker-compose up`

4. **Configura le Environment Variables**
   Copia le variabili da `env.render.example` e configura:
   - `DATABASE_URL`: Render fornirà automaticamente questa URL
   - `NEXTAUTH_URL`: `https://your-app-name.onrender.com`
   - `GOOGLE_CLIENT_ID`: Le tue credenziali Google OAuth
   - `GOOGLE_CLIENT_SECRET`: Le tue credenziali Google OAuth
   - `NEXTAUTH_SECRET`: Una stringa segreta casuale

5. **Deploy automatico**
   - Render farà il deploy automaticamente
   - Ogni push su GitHub triggererà un nuovo deploy

### Note per il Deploy
- ✅ **Database incluso**: Render fornisce PostgreSQL gratuito
- ✅ **SSL automatico**: HTTPS incluso
- ✅ **Deploy automatico**: Ad ogni push su GitHub
- ✅ **Logs**: Disponibili nel dashboard Render
- ⚠️ **Limiti gratuiti**: 750 ore/mese di runtime

## 🔧 Configurazione

### Variabili Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:password@postgres:5432/lesson_app"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# External Services (opzionali)
MAILGUN_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
STRIPE_SECRET_KEY=""
PAYPAL_CLIENT_ID=""
```

### Google OAuth Setup

1. Vai su [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuovo progetto o seleziona uno esistente
3. Abilita l'API Google+ 
4. Crea credenziali OAuth 2.0
5. Aggiungi URI di reindirizzamento: `http://localhost:3000/api/auth/callback/google`
6. Copia Client ID e Client Secret in `.env`

## 📊 Dati di Test

Il database viene popolato automaticamente con:

- **2 Maestri**: Marco Rossi (Tennis), Laura Bianchi (Nuoto)
- **2 Studenti**: Giuseppe Verdi, Anna Neri
- **3 Tag**: Tennis, Nuoto, Principiante

Credenziali di test:
- Master: `master1@example.com`, `master2@example.com`
- Student: `student1@example.com`, `student2@example.com`

## 🛠️ Comandi Utili

```bash
# Gestione container
docker-compose up -d          # Avvia tutti i servizi
docker-compose down           # Ferma tutti i servizi
docker-compose logs -f        # Visualizza log in tempo reale

# Database
docker-compose exec backend npx prisma db push    # Sincronizza schema
docker-compose exec backend node prisma/seed.js   # Popola dati di test
docker-compose exec postgres psql -U postgres -d lesson_app  # Accesso DB

# Sviluppo
docker-compose exec backend npm run dev           # Backend dev server
docker-compose exec frontend npm run dev          # Frontend dev server
```

## 🔍 Troubleshooting

### Problemi Comuni

1. **Container non si avviano**
   ```bash
   docker-compose down
   docker-compose up -d --force-recreate
   ```

2. **Errori di database**
   ```bash
   docker-compose exec backend npx prisma generate
   docker-compose exec backend npx prisma db push
   ```

3. **Problemi di autenticazione**
   - Verifica le credenziali Google in `.env`
   - Controlla che NEXTAUTH_URL sia corretto
   - Verifica gli URI di reindirizzamento in Google Console

4. **Porte già in uso**
   - Cambia le porte in `docker-compose.yml`
   - Ferma altri servizi che usano le stesse porte

## 📈 Prossimi Passi

1. **Implementare CRUD API** per tutte le entità
2. **Creare dashboard** per maestri e studenti
3. **Sistema di prenotazione** con calendario
4. **Sistema di messaggistica** in tempo reale
5. **Integrazioni esterne** (email, SMS, pagamenti)

## 🤝 Contribuire

1. Fork il repository
2. Crea un branch per la feature (`git checkout -b feature/nuova-feature`)
3. Commit le modifiche (`git commit -am 'Aggiunge nuova feature'`)
4. Push al branch (`git push origin feature/nuova-feature`)
5. Crea una Pull Request

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli. 