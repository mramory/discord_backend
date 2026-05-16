# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in the backend submodule.

This is the `discord_backend` submodule of a Discord-clone monorepo. The frontend, docker-compose, and shared `.env` live in the parent directory (see its `CLAUDE.md` for cross-cutting concerns).

## Commands

```bash
yarn migrate          # prisma generate + prisma db push (NOT migrate dev — schema is pushed, no migration files kept)
yarn fixtures         # prisma db seed (runs prisma/seed.ts)
yarn start:dev        # nest start --watch
yarn start:prod       # node dist/main (after yarn build)
yarn lint             # eslint --fix on src/apps/libs/test
yarn test             # jest, rootDir is src, picks up *.spec.ts
yarn test:e2e         # uses test/jest-e2e.json
yarn test -- path/to/file.spec.ts   # single test file
yarn generate:enums   # runs scripts/generate-enums.ts (regenerates TS enums from Prisma)
```

Schema is applied with `prisma db push` (no migration files). Treat schema changes as destructive in dev — the parent repo's `clean-docker.sh` wipes the postgres volume.

## Architecture

Entry: `src/main.ts` bootstraps a Nest app with a global `ValidationPipe`, `cookie-parser`, and CORS pinned to `http://localhost:3000` with credentials. Listens on `process.env.PORT || 8080`.

`AppModule` (`src/app.module.ts`) composes feature modules — each is a self-contained Nest module under `src/<name>/`:

- `auth` — JWT + Passport, cookie-based sessions, password reset via nodemailer
- `user` — profile CRUD
- `friends` — `FriendRequest` (PENDING/ACCEPTED/REJECTED) → `Friendship` once accepted
- `conversation` — both DM and server-channel conversations live in one `Conversation` model, discriminated by `ConversationType` (DIALOG vs SERVER) and `ContentType` (TEXT/VOICE/VIDEO)
- `server` — Discord-style guilds; a `Server` owns multiple channel `Conversation`s and has a unique `inviteCode`
- `messages` — text + image messages tied to a `Conversation`
- `cloudinary` — image upload service used by user/server/message
- `pusher` — Pusher Channels for chat fanout
- `socket` — socket.io gateway for WebRTC signaling (voice/video)

Prisma is wired through a shared `PrismaService` (`src/prisma.service.ts`); inject it instead of `new PrismaClient()`.

## Data model (`prisma/schema.prisma`)

- `Conversation` is the single message container for both DMs and server channels — `serverId` is nullable; null = direct conversation.
- `Friendship` is symmetric but stored once with `initiator`/`receiver` roles; `FriendRequest` is the pending-state precursor that flips into a `Friendship` on acceptance.
- `Message.image` is a Cloudinary URL; text-only, voice, and video conversations all use the same row shape (`ContentType` lives on the parent `Conversation`).
- The default user avatar is a hardcoded Cloudinary URL in the schema.

## Realtime stack

Two transports run in parallel — pick the right one per feature:

- **Pusher Channels** (`pusher` SDK) — chat messages, presence, friend events.
- **socket.io** (`@nestjs/platform-socket.io`) — WebRTC signaling for voice/video rooms.

Don't mix transports for the same event.
