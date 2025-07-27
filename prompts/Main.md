# Piattaforma di Coaching Sportivo - Prompt di Sviluppo

## 🎯 Obiettivo
Sviluppare una piattaforma completa per connettere maestri e studenti per lezioni di sport, utilizzando Next.js, TypeScript, Prisma, PostgreSQL e Docker.

## ✅ **COMPLETATO** - Setup Base e Infrastruttura

### Infrastruttura Docker
- ✅ `docker-compose.yml` configurato con 3 servizi (postgres, backend, frontend)
- ✅ Container PostgreSQL con persistenza dati
- ✅ Build multi-stage per ottimizzazione
- ✅ Restart policy `unless-stopped`
- ✅ Passaggio variabili ambiente da `.env`

### Database e Schema
- ✅ Schema Prisma completo con tutte le entità
- ✅ Tabelle create: User, MasterProfile, StudentProfile, Appointment, Message, Tag, Automation, Report
- ✅ Relazioni e vincoli definiti
- ✅ Database sincronizzato con `prisma db push`
- ✅ Dati di test inseriti (2 maestri, 2 studenti, 3 tag)

### Autenticazione e Registrazione
- ✅ NextAuth.js configurato con Google OAuth e login manuale
- ✅ Provider Google funzionante con callback corretti
- ✅ Gestione sessioni JWT con dati aggiornati dal database
- ✅ Sistema di registrazione completo per MASTER e STUDENT
- ✅ Selezione ruolo con pagina dedicata
- ✅ Completamento profilo con form dinamici
- ✅ Redirect intelligenti basati su ruolo e stato profilo

### Dashboard e Profili
- ✅ Dashboard complete per maestri e studenti
- ✅ Modifica profilo con form dedicati
- ✅ Logout funzionante nelle dashboard
- ✅ API per gestione profili (`/api/users/profile`, `/api/users/update-profile`)
- ✅ API per aggiornamento ruolo (`/api/users/update-role`)

### Sistema di Prenotazione - FASE 1
- ✅ API CRUD per appuntamenti (`/api/appointments`)
- ✅ Ricerca maestri con filtri avanzati (`/api/masters/search`)
- ✅ Profilo maestro con dettagli e prenotazione (`/masters/[id]`)
- ✅ Form di prenotazione integrato nel profilo maestro
- ✅ Gestione stati appuntamento (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- ✅ Controllo conflitti temporali durante la prenotazione
- ✅ Lista appuntamenti con filtri per stato (`/appointments`)
- ✅ Dettagli appuntamento con azioni per ruolo (`/appointments/[id]`)
- ✅ Validazione e gestione errori completa

### Frontend e Backend
- ✅ Homepage con login/logout e redirect intelligenti
- ✅ Routing e layout responsive
- ✅ TypeScript configurato
- ✅ TailwindCSS integrato
- ✅ Struttura API routes Next.js
- ✅ Prisma client configurato
- ✅ TypeScript per type safety
- ✅ Servizi stub per integrazioni esterne

## 🔄 **IN SVILUPPO** - Funzionalità Core

### Sistema di Prenotazione - FASE 2
- 🔄 Calendario interattivo per maestri
- 🔄 Gestione disponibilità maestri
- 🔄 Sistema di disponibilità avanzato
- 🔄 Notifiche automatiche

### Messaggistica
- 🔄 Chat tra maestro e studente
- 🔄 Messaggi legati agli appuntamenti
- 🔄 Notifiche in tempo reale
- 🔄 Storico conversazioni

### Sistema di Pagamento
- 🔄 Integrazione Stripe per pagamenti
- 🔄 Integrazione PayPal come alternativa
- 🔄 Gestione fatturazione
- 🔄 Storico transazioni

### Notifiche e Comunicazioni
- 🔄 Email notifications (Mailgun)
- 🔄 SMS notifications (Twilio)
- 🔄 Notifiche push in-app
- 🔄 Template email personalizzati

## 📋 **ROADMAP** - Funzionalità Avanzate

### Integrazioni Esterne
- 📋 Google Calendar sync
- 📋 Email notifications (Mailgun)
- 📋 SMS notifications (Twilio)
- 📋 Pagamenti (Stripe, PayPal)

### Automazioni
- 📋 Notifiche automatiche
- 📋 Gestione cancellazioni
- 📋 Sistema di replacement
- 📋 Workflow automation

### Reporting e Analytics
- 📋 Dashboard analytics per maestri
- 📋 Report performance
- 📋 Metriche utilizzo
- 📋 Export dati

## 🛠️ **Stack Tecnologico**

### Frontend
- Next.js 14 con TypeScript
- TailwindCSS per styling
- NextAuth.js per autenticazione
- @tanstack/react-query per state management
- Lucide React per icone

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL database
- TypeScript per type safety

### Infrastruttura
- Docker e Docker Compose
- PostgreSQL 15 container
- Node.js 18 runtime
- Multi-stage builds

## 📊 **Dati di Test Inseriti**

### Utenti
- **Marco Rossi** (master1@example.com) - Maestro di tennis
- **Laura Bianchi** (master2@example.com) - Istruttrice di nuoto
- **Giuseppe Verdi** (student1@example.com) - Studente tennis
- **Anna Neri** (student2@example.com) - Studentessa nuoto

### Tag
- Tennis (#FF6B6B)
- Nuoto (#4ECDC4)
- Principiante (#45B7D1)

## 🎯 **PROSSIMI STEP IMMEDIATI**

### Opzione A: Sistema di Prenotazione - FASE 2 🔄 PRIORITÀ ALTA
- 🔄 Calendario interattivo per maestri
- 🔄 Gestione disponibilità maestri
- 🔄 Sistema di disponibilità avanzato
- 🔄 Notifiche automatiche per appuntamenti

### Opzione B: Sistema di Messaggistica 🔄 PRIORITÀ MEDIA
- 🔄 API endpoints per Message (CRUD)
- 🔄 Chat in tempo reale tra utenti
- 🔄 Messaggi legati agli appuntamenti
- 🔄 Notifiche push per nuovi messaggi
- 🔄 Storico conversazioni

### Opzione C: Sistema di Pagamento 🔄 PRIORITÀ ALTA
- 🔄 Integrazione Stripe per pagamenti
- 🔄 Gestione fatturazione automatica
- 🔄 Sistema di rimborsi
- 🔄 Storico transazioni
- 🔄 Dashboard finanziario per maestri

### Opzione D: Notifiche e Comunicazioni 🔄 PRIORITÀ MEDIA
- 🔄 Integrazione Mailgun per email
- 🔄 Integrazione Twilio per SMS
- 🔄 Template personalizzati
- 🔄 Notifiche automatiche per appuntamenti
- 🔄 Sistema di reminder

## 🐛 **Troubleshooting Recente**

### Problemi Risolti
- ✅ Build Docker con Node 18 (risolto problema OpenSSL)
- ✅ Package-lock.json generato correttamente
- ✅ Prisma db push funzionante
- ✅ Seed database con dati di test
- ✅ NextAuth configurato nel frontend
- ✅ Google OAuth callback errors risolti
- ✅ Ruolo TO_BE_DEFINED implementato
- ✅ Sessione NextAuth aggiornata dal database
- ✅ Redirect intelligenti implementati
- ✅ Modifica profilo funzionante

### Problemi Attuali
- Nessun problema critico
- Sistema pronto per sviluppo funzionalità core

## 📝 **Note di Sviluppo**

### Architettura
- Frontend e backend separati in container Docker
- NextAuth configurato nel frontend per semplicità
- Database PostgreSQL con Prisma ORM
- TypeScript per type safety completo

### Best Practices
- Containerizzazione completa per portabilità
- Type safety con TypeScript
- Validazione input con Zod
- Gestione errori centralizzata
- Documentazione inline

### Performance
- Multi-stage Docker builds
- Prisma query optimization
- React Query per caching
- Lazy loading dei componenti

---

**Stato:** Sistema di autenticazione e profili completato, pronto per sviluppo funzionalità core 🚀
**Ultimo aggiornamento:** Dicembre 2024
**Prossimo focus:** Sistema di prenotazione e pagamenti 