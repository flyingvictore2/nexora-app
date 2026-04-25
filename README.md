# 🎬 NEXORA — Plataforma de Streaming Profesional

> Stack completo · Production-ready · Escalable a +10.000 usuarios

---

## 📋 Índice

- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Inicio rápido con Docker](#inicio-rápido-con-docker)
- [Desarrollo local](#desarrollo-local)
- [Variables de entorno](#variables-de-entorno)
- [API Documentation](#api-documentation)
- [Panel de administrador](#panel-de-administrador)
- [Credenciales de prueba](#credenciales-de-prueba)
- [Stripe (pagos)](#stripe-pagos)
- [Arquitectura](#arquitectura)

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| **Frontend** | Next.js 14 (App Router) · React 18 · TailwindCSS · Zustand · TanStack Query |
| **Backend** | NestJS · Node.js 20 · Swagger |
| **Base de datos** | PostgreSQL 16 · Prisma ORM |
| **Autenticación** | JWT + Refresh Tokens · Google OAuth |
| **Reproductor** | Video.js · HLS (m3u8) · MP4 |
| **Pagos** | Stripe (Checkout Sessions + Webhooks + Portal) |
| **Email** | Nodemailer (SMTP) |
| **Infraestructura** | Docker · Docker Compose · NGINX |
| **Animaciones** | Framer Motion |
| **Gráficas** | Recharts |

---

## Estructura del proyecto

```
nexora/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── auth/               # JWT, refresh, Google OAuth
│   │   ├── users/              # Gestión de usuarios
│   │   ├── profiles/           # Perfiles de usuario (hasta 4)
│   │   ├── content/            # Películas, series, anime
│   │   ├── seasons/            # Temporadas
│   │   ├── episodes/           # Episodios con intro skip
│   │   ├── subscriptions/      # Planes FREE/PREMIUM/VIP
│   │   ├── payments/           # Stripe integration
│   │   ├── watch-history/      # Progreso de visualización
│   │   ├── ratings/            # Sistema de valoraciones
│   │   ├── favorites/          # Lista personal
│   │   ├── recommendations/    # Recomendaciones dinámicas
│   │   ├── analytics/          # Métricas de plataforma
│   │   ├── admin/              # Dashboard admin
│   │   ├── notifications/      # Email + in-app
│   │   ├── uploads/            # Imágenes (Sharp/WebP)
│   │   ├── health/             # Health check endpoint
│   │   ├── common/             # Filtros, interceptores, decoradores
│   │   └── prisma/             # PrismaService (global)
│   ├── prisma/
│   │   ├── schema.prisma       # Esquema completo BD
│   │   └── seed.ts             # Datos de ejemplo
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                   # Next.js App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Home (tipo Netflix)
│   │   │   ├── auth/           # Login, Register, Verify, Reset
│   │   │   ├── watch/[id]/     # Detalle + reproductor
│   │   │   ├── browse/         # Explorador con filtros
│   │   │   ├── profiles/       # Selección y gestión de perfiles
│   │   │   ├── my-list/        # Lista personal (favoritos)
│   │   │   ├── account/        # Configuración de cuenta
│   │   │   ├── subscription/   # Planes y confirmación
│   │   │   ├── notifications/  # Centro de notificaciones
│   │   │   └── admin/          # Panel admin completo
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── content/        # ContentCard, ContentRow, HeroBanner
│   │   │   ├── player/         # VideoPlayer (Video.js + HLS)
│   │   │   ├── admin/          # AdminLayout, ContentForm
│   │   │   └── providers.tsx   # QueryClient, Toaster
│   │   ├── hooks/              # useContent, useAuth (TanStack Query)
│   │   ├── lib/                # api.ts (Axios + interceptores), utils
│   │   └── store/              # Zustand (auth, theme)
│   ├── Dockerfile
│   └── package.json
│
├── nginx/
│   └── nginx.conf              # Reverse proxy + rate limiting
├── scripts/
│   ├── init.sh                 # Script Linux/Mac
│   └── init.bat                # Script Windows
├── Makefile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Inicio rápido con Docker

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Puerto 3000, 4000, 5432, 6379 libres

### 1. Clonar y configurar entorno

```bash
# Entrar al directorio del proyecto
cd nexora

# Copiar variables de entorno
cp .env.example .env
```

Edita `.env` con tus credenciales reales (ver sección Variables de entorno).

### 2. Lanzar con un solo comando

```bash
docker compose up -d --build
```

Esto levanta automáticamente:
- 🐘 PostgreSQL (puerto 5432)
- 🔴 Redis (puerto 6379)
- ⚙️  NestJS Backend (puerto 4000)
- ⚡ Next.js Frontend (puerto 3000)
- 🌐 NGINX Reverse Proxy (puerto 80)

### 3. Inicializar la base de datos

```bash
# Ejecutar migraciones
docker compose exec backend npx prisma migrate deploy

# Sembrar datos de ejemplo
docker compose exec backend npx ts-node prisma/seed.ts
```

### 4. ¡Listo!

| Servicio | URL |
|----------|-----|
| 🎬 Frontend | http://localhost:3000 |
| ⚙️  API | http://localhost:4000/api/v1 |
| 📚 Swagger | http://localhost:4000/api/docs |
| 🗄️  Prisma Studio | `make studio` (local) |

---

## Desarrollo local

Si prefieres ejecutar sin Docker para desarrollo:

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Levantar base de datos (necesitas PostgreSQL local o usar Docker solo para BD)
docker compose up -d postgres redis

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate deploy

# Sembrar datos
npx ts-node prisma/seed.ts

# Iniciar en modo desarrollo (hot reload)
npm run start:dev
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

Visita http://localhost:3000

---

## Variables de entorno

Copia `.env.example` a `.env` y completa:

```env
# ── Base de datos ──────────────────────────────────────
DATABASE_URL=postgresql://nexora:nexora_secret@localhost:5432/nexora

# ── JWT (usa cadenas largas y aleatorias) ──────────────
JWT_SECRET=cambia_esto_minimo_32_caracteres_aleatorios
JWT_REFRESH_SECRET=cambia_esto_tambien_minimo_32_chars

# ── Email SMTP ─────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tuemail@gmail.com
SMTP_PASS=tu_app_password_de_gmail   # Contraseña de aplicación, no la normal

# ── Google OAuth (opcional) ────────────────────────────
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...

# ── Stripe ─────────────────────────────────────────────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# ── URLs firmadas para videos ──────────────────────────
SIGNED_URL_SECRET=otro_secreto_largo_aleatorio
```

---

## API Documentation

Swagger UI disponible en: **http://localhost:4000/api/docs**

### Endpoints principales

#### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Registro de usuario |
| POST | `/api/v1/auth/login` | Inicio de sesión |
| POST | `/api/v1/auth/refresh` | Renovar access token |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| POST | `/api/v1/auth/verify-email` | Verificar email |
| POST | `/api/v1/auth/forgot-password` | Solicitar reset |
| POST | `/api/v1/auth/reset-password` | Restablecer contraseña |
| GET  | `/api/v1/auth/google` | OAuth Google |

#### Contenido
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/content` | Listar con filtros/búsqueda |
| GET | `/api/v1/content/featured` | Contenido destacado |
| GET | `/api/v1/content/trending` | Tendencias |
| GET | `/api/v1/content/:id` | Detalle completo |
| GET | `/api/v1/content/:id/signed-url` | URL firmada para video |
| POST | `/api/v1/content` | Crear (Admin) |
| PUT | `/api/v1/content/:id` | Actualizar (Admin) |
| DELETE | `/api/v1/content/:id` | Eliminar (Admin) |

#### Reproductor / Historial
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/watch-history/progress` | Guardar progreso |
| GET | `/api/v1/watch-history/continue-watching` | Seguir viendo |
| GET | `/api/v1/watch-history` | Historial completo |

#### Suscripciones / Pagos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/subscriptions/plans` | Listar planes |
| GET | `/api/v1/subscriptions/my` | Mi suscripción |
| POST | `/api/v1/payments/checkout` | Crear sesión Stripe |
| POST | `/api/v1/payments/portal` | Portal de facturación |
| POST | `/api/v1/payments/webhook` | Webhook Stripe |

---

## Panel de administrador

Accede en: **http://localhost:3000/admin**

### Funcionalidades

| Sección | Funcionalidades |
|---------|----------------|
| 📊 Dashboard | Métricas en tiempo real, gráficas de crecimiento, ingresos y visualizaciones |
| 🎬 Contenido | CRUD completo: añadir por URL (m3u8/mp4), subir imágenes, programar estrenos, destacar |
| 📺 Series | Gestión de temporadas y episodios con intro skip |
| 👥 Usuarios | Listar, bloquear/desbloquear, promover a admin, ver actividad |
| 💳 Planes | Editar precios, días de prueba, calidad, dispositivos, Stripe IDs |
| 📈 Analíticas | Gráficas detalladas: usuarios, ingresos, tiempo de visualización, distribución de planes |

---

## Credenciales de prueba

```
👑 Administrador
   Email:    admin@nexora.com
   Password: Admin123!
   Plan:     VIP (ilimitado)

👤 Usuario demo
   Email:    demo@nexora.com
   Password: User123!
   Plan:     Premium
```

---

## Stripe (pagos)

### Configurar Stripe

1. Crea una cuenta en [stripe.com](https://stripe.com)
2. Ve a **Dashboard → Developers → API keys**
3. Copia `Publishable key` y `Secret key` al `.env`
4. Crea los productos en Stripe:
   - Plan Premium: $12.99/mes
   - Plan VIP: $19.99/mes
5. Copia los `Price ID` a la base de datos (panel admin → Planes)

### Webhook local con Stripe CLI

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Escuchar webhooks localmente
stripe listen --forward-to localhost:4000/api/v1/payments/webhook

# Copia el webhook secret que aparece y ponlo en STRIPE_WEBHOOK_SECRET
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     NGINX (puerto 80)                    │
│            Reverse proxy + Rate limiting                 │
└─────────────────┬─────────────────┬────────────────────-┘
                  │                 │
        ┌─────────▼──────┐  ┌──────▼──────────┐
        │   Next.js      │  │   NestJS API     │
        │  (puerto 3000) │  │  (puerto 4000)   │
        │                │  │                  │
        │  - App Router  │  │  - REST API      │
        │  - SSR/CSR     │  │  - Swagger       │
        │  - Zustand     │  │  - JWT Auth      │
        │  - TanStack Q  │  │  - Stripe        │
        └────────────────┘  └──────┬──────────-┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │               │
             ┌──────▼──────┐ ┌────▼────┐  ┌──────▼──────┐
             │  PostgreSQL  │ │  Redis  │  │   Storage   │
             │  (Prisma)    │ │ (Cache) │  │  (uploads/) │
             └─────────────┘ └─────────┘  └─────────────┘
```

### Características de escalabilidad

- **Stateless API**: JWT sin sesiones en servidor
- **Connection pooling**: Prisma gestiona el pool de conexiones
- **Redis**: Caché de sesiones y rate limiting compartido
- **NGINX**: Load balancing y rate limiting por IP
- **Docker**: Fácil escalado horizontal con `docker compose scale backend=3`

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Ejecutar comandos en un contenedor
docker compose exec backend npx prisma studio

# Resetear base de datos y resembrar
make db-reset

# Parar todo
docker compose down

# Parar y eliminar volúmenes (BORRA LA BD)
docker compose down -v
```

---

## Licencia

Proyecto privado — Nexora © 2025. Todos los derechos reservados.
