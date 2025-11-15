# RFID Wardrobe Organizer

## Overview

A mobile-first wardrobe management application that uses RFID/NFC tag scanning to catalog and organize clothing items. The app enables users to scan clothing tags, track wear patterns, generate outfit combinations, and manage their wardrobe digitally with a visual Pinterest-style interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**UI Component Library**: Shadcn/ui with Radix UI primitives, styled using Tailwind CSS with a custom design system. The application follows the "New York" style variant with customized color schemes and spacing.

**Design System**: Mobile-first approach with Inter font family, featuring:
- Material Design meets Pinterest-style visual grids
- Masonry-style grid layouts for clothing display (2-4 columns responsive)
- Card-based architecture with 3:4 aspect ratio images
- Bottom navigation bar for primary app sections
- Custom color palette using CSS variables for theming

**Routing**: Wouter for client-side routing with the following main routes:
- `/scanner` - RFID tag scanning interface
- `/wardrobe` - Grid view of all clothing items
- `/outfits` - Outfit generation and management
- `/profile` - User statistics and settings
- `/add` - Form to add new clothing items
- `/clothing/:id` - Individual clothing item details

**State Management**: TanStack Query (React Query) for server state management with infinite stale time and disabled refetching, providing optimistic updates and caching.

**Form Handling**: React Hook Form with Zod schema validation for type-safe form inputs.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API architecture with JSON request/response format. Currently implements in-memory storage but architected for database integration.

**Key API Endpoints**:
- `GET/POST /api/clothing` - Retrieve all items or create new clothing
- `GET/PUT/DELETE /api/clothing/:id` - Single item operations
- `GET /api/outfits` - Outfit management
- Tag ID uniqueness validation on creation

**Development Setup**: Custom Vite middleware integration for HMR (Hot Module Replacement) during development, with separate production build process using esbuild for server bundling.

**Storage Layer**: Abstract storage interface (`IStorage`) currently implemented with `MemStorage` for development. Includes sample seed data for demonstration. The interface defines methods for:
- User management (create, retrieve by username/id)
- Clothing CRUD operations
- Outfit management
- Wear tracking functionality

### Data Models

**Database Schema** (Drizzle ORM with PostgreSQL):

**Users Table**:
- `id` (UUID primary key)
- `username` (unique text)
- `password` (text)

**Clothing Table**:
- `id` (UUID primary key)
- `tagId` (unique text) - RFID/NFC identifier
- `name`, `category`, `color`, `season`, `occasion` (text fields)
- `imageUrl` (optional text)
- `lastWorn` (timestamp)
- `timesWorn` (integer, default 0)
- `createdAt` (timestamp)

**Categories**: top, bottom, shoes, outerwear, accessory
**Seasons**: spring, summer, fall, winter, all
**Occasions**: casual, formal, athletic, business, any

**Outfits Table**:
- `id` (UUID primary key)
- `name`, `occasion`, `season` (text fields)
- `clothingIds` (text array) - References to clothing items
- `createdAt` (timestamp)

**Validation**: Zod schemas derived from Drizzle table definitions ensure type safety across client and server.

### External Dependencies

**UI Component Dependencies**:
- Radix UI components for accessible primitives (dialogs, dropdowns, tooltips, etc.)
- Lucide React for icon system
- class-variance-authority and clsx for dynamic styling
- Embla Carousel for horizontal scrolling components
- cmdk for command palette interface

**Database & ORM**:
- Drizzle ORM for type-safe database operations
- drizzle-zod for automatic schema validation generation
- @neondatabase/serverless for PostgreSQL connection (Neon serverless driver)
- connect-pg-simple for session storage (prepared for authentication)

**Development Tools**:
- TypeScript for type safety across the stack
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Vite plugins for Replit integration (error overlay, dev banner, cartographer)

**Utility Libraries**:
- date-fns for date manipulation
- wouter for lightweight routing
- nanoid for unique ID generation

### Build & Deployment

**Development**: 
- `npm run dev` - Runs Express server with Vite middleware for HMR
- Database changes via `npm run db:push` using Drizzle Kit

**Production**:
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server to `dist/index.js`
- Node.js serves bundled application

**Configuration Requirements**:
- `DATABASE_URL` environment variable must be set (throws error if missing)
- Drizzle migrations output to `./migrations`