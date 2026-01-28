# replit.md

## Overview

This is a location-based mapping application built with a React frontend and Express backend. The app allows users to view, create, and explore locations on an interactive Leaflet map. The map is centered on Taipei, Taiwan (coordinates: 25.0771545, 121.5733916). Users can add new locations with names, descriptions, coordinates, and categories, then navigate to them on the map.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Mapping**: Leaflet with react-leaflet bindings for interactive maps

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful API with routes defined in `shared/routes.ts`
- **Validation**: Zod schemas shared between frontend and backend for type-safe API contracts
- **Build System**: Vite for frontend, esbuild for backend bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains table definitions
- **Migrations**: Drizzle Kit handles schema migrations (output to `./migrations`)
- **Connection**: Uses `DATABASE_URL` environment variable

### Project Structure
- `client/` - React frontend application
- `server/` - Express backend server
- `shared/` - Shared code (schema, API route definitions, types)
- `script/` - Build scripts

### Key Design Decisions

1. **Shared Schema Pattern**: Database schemas defined with Drizzle in `shared/schema.ts` are used to generate both TypeScript types and Zod validation schemas, ensuring type safety across the full stack.

2. **API Contract Pattern**: Routes are defined declaratively in `shared/routes.ts` with Zod schemas for inputs and responses, enabling type-safe API calls from the frontend.

3. **Component Library**: Uses shadcn/ui which provides unstyled, accessible components that can be customized. Components are copied into `client/src/components/ui/`.

4. **Storage Abstraction**: The `IStorage` interface in `server/storage.ts` abstracts database operations, making it easier to test or swap storage implementations.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage in PostgreSQL (available but may not be active)

### Mapping
- **Leaflet**: Core mapping library for interactive maps
- **react-leaflet**: React wrapper for Leaflet components
- **Map Tiles**: Uses OpenStreetMap tile server (default)

### Development Tools
- **Vite**: Frontend dev server with HMR
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for development
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling

### UI/UX
- **Radix UI**: Headless UI primitives (dialogs, dropdowns, tooltips, etc.)
- **Lucide React**: Icon library
- **Google Fonts**: Outfit (display) and Inter (body) fonts