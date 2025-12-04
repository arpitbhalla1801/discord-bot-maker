# Discord Bot Maker

A no-code web-based platform for creating fully functional Discord bots using a visual UI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Postgres with Prisma ORM
- **Authentication**: Better-Auth with Discord OAuth
- **UI**: Tailwind CSS
- **State Management**: Zustand
- **Language**: TypeScript

## Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `DATABASE_URL` - Your Neon Postgres connection string
- `BETTER_AUTH_SECRET` - Random secret key
- `DISCORD_CLIENT_ID` - From Discord Developer Portal
- `DISCORD_CLIENT_SECRET` - From Discord Developer Portal

### 3. Set Up Database

```bash
# Generate Prisma Client
bun run prisma:generate

# Push schema to database
bun run db:push
```

### 4. Run Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Management

See [PRISMA_SETUP.md](./PRISMA_SETUP.md) for detailed Prisma and database setup instructions.

Quick commands:
- `bun run db:push` - Push schema changes
- `bun run db:studio` - Open Prisma Studio
- `bun run prisma:generate` - Regenerate Prisma Client

## Features

- 🎨 **Visual Bot Builder** - Create commands and events with a drag-and-drop interface
- 🔐 **Discord OAuth** - Secure authentication with Discord
- 💾 **Database Persistence** - Save your bots and configurations
- 📦 **Code Export** - Download production-ready bot code
- 🎯 **Type-Safe** - Full TypeScript support throughout

## Project Structure

```
discord-bot-maker/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Core libraries (auth, db)
│   ├── store/           # Zustand state management
│   └── utils/           # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
└── data/                # Local data (gitignored)
```
