# RFID Wardrobe Organizer

## Overview

A mobile-first wardrobe management application that uses RFID/NFC tag scanning to catalog and organize clothing items. The app enables users to scan clothing tags, track wear patterns, generate outfit combinations, manage laundry status, and organize their wardrobe digitally with a visual Pinterest-style interface.

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
- `/wardrobe` - Grid view of all clothing items with laundry filters
- `/outfits` - Outfit generation, favorites, and history
- `/profile` - Stats dashboard with analytics
- `/add` - Form to add new clothing items with photo upload
- `/clothing/:id` - Individual clothing item details with laundry toggle

**State Management**: TanStack Query (React Query) for server state management with cache invalidation on mutations.

**Form Handling**: React Hook Form with Zod schema validation for type-safe form inputs.

### Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**API Design**: RESTful API architecture with JSON request/response format using DatabaseStorage with PostgreSQL.

**Key API Endpoints**:
- `GET/POST /api/clothing` - Retrieve all items or create new clothing
- `GET/PUT/DELETE /api/clothing/:id` - Single item operations
- `PATCH /api/clothing/:id/worn` - Mark item as worn today
- `PATCH /api/clothing/:id/laundry` - Toggle laundry status
- `GET /api/clothing/available` - Get non-laundry items only
- `GET/POST /api/outfits` - Outfit management
- `DELETE /api/outfits/:id` - Delete outfit
- `PATCH /api/outfits/:id/favorite` - Toggle favorite status
- `PATCH /api/outfits/:id/worn` - Mark outfit as worn
- `POST /api/object-storage/presigned-url` - Get upload URL for images

**Object Storage**: Replit Object Storage integration for clothing photo uploads. Normalized paths (`/objects/<id>`) stored in database for persistent image access.

**Storage Layer**: MemStorage (in-memory) while awaiting a valid PostgreSQL connection. Previously used DatabaseStorage with Drizzle ORM. Data resets on server restart. Includes sample seed data loaded at startup. The interface defines methods for:
- User management (create, retrieve by username/id)
- Clothing CRUD operations with laundry tracking
- Outfit management with favorites and wear history
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
- `imageUrl` (optional text) - Normalized object path for photo
- `inLaundry` (integer, 0=available, 1=in laundry)
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
- `isFavorite` (integer, 0=false, 1=true)
- `lastWorn` (timestamp)
- `timesWorn` (integer, default 0)
- `createdAt` (timestamp)

**Validation**: Zod schemas derived from Drizzle table definitions ensure type safety across client and server.

### Key Features

**Photo Upload**: ObjectUploader component using Uppy with presigned URLs for direct-to-storage uploads. Returns normalized objectPath for database storage.

**Laundry Tracking**: Toggle laundry status from clothing detail page. Wardrobe view shows availability counts and filters (All, Available, Laundry). Outfit generator excludes items in laundry.

**Outfit Generation**: Random outfit combinations based on occasion and season filters. Save to history, mark as favorites, track wear frequency.

**Stats Dashboard**: Enhanced profile page with tabs:
- Items: Most worn, never worn, in laundry
- Outfits: Favorites count, total wears, history
- Analytics: Category breakdown, seasonal distribution, top colors, occasion split, wardrobe health utilization

### External Dependencies

**UI Component Dependencies**:
- Radix UI components for accessible primitives (dialogs, dropdowns, tooltips, tabs, progress)
- Lucide React for icon system
- class-variance-authority and clsx for dynamic styling
- Embla Carousel for horizontal scrolling components

**Database & ORM**:
- Drizzle ORM for type-safe database operations
- drizzle-zod for automatic schema validation generation
- @neondatabase/serverless for PostgreSQL connection (Neon serverless driver)

**Object Storage**:
- @google-cloud/storage for Replit Object Storage
- @uppy/core, @uppy/react, @uppy/dashboard, @uppy/aws-s3 for file uploads

**Development Tools**:
- TypeScript for type safety across the stack
- tsx for TypeScript execution in development
- esbuild for production server bundling
- Vite plugins for Replit integration (error overlay, dev banner, cartographer)

**Utility Libraries**:
- date-fns for date manipulation
- wouter for lightweight routing

### Build & Deployment

**Development**: 
- `npm run dev` - Runs Express server with Vite middleware for HMR
- Database changes via `npm run db:push` using Drizzle Kit

**Production**:
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles server to `dist/index.js`
- Node.js serves bundled application

**Configuration Requirements**:
- `DATABASE_URL` environment variable must be set
- Object storage bucket configured via Replit integration
- Drizzle migrations output to `./migrations`
