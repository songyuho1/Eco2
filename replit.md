# Overview

This is an ESG (Environmental, Social, Governance) educational game application built with React and Express. The application presents users with environmental decision-making scenarios across different themes (cute, scary, realistic, futuristic, dramatic) where players make choices that impact environmental scores, economic scores, and carbon emissions. The game tracks progress through 10 scenarios per theme and determines whether humanity needs to migrate to Mars based on accumulated environmental damage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript**: Modern React application using TypeScript for type safety
- **Vite**: Build tool and development server for fast development experience
- **Wouter**: Lightweight client-side routing library for navigation
- **TanStack Query**: Data fetching and state management for API interactions
- **Shadcn/ui**: Component library built on Radix UI primitives with Tailwind CSS styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design

## Backend Architecture
- **Express.js**: Node.js web framework serving REST API endpoints
- **TypeScript**: Type-safe server-side development
- **In-Memory Storage**: MemStorage class implementing game data persistence during runtime
- **RESTful API Design**: Clean API structure for game sessions, stories, and choices

## Data Storage Solutions
- **Drizzle ORM**: Database toolkit configured for PostgreSQL with schema definitions
- **PostgreSQL**: Production database (configured but not actively used in current implementation)
- **In-Memory Storage**: Current implementation uses memory-based storage for development
- **Schema Management**: Centralized schema definitions in shared module for type consistency

## Game Logic & State Management
- **Session-based Gameplay**: Each game session tracks theme, scores, and current progress
- **Score Tracking System**: 
  - Environment Score (0-100)
  - Economic Score (0-100) 
  - Carbon Emissions (starting at 400ppm, max 600ppm)
- **Theme-based Content**: 5 distinct themes each with 10 scenarios and multiple choices
- **Impact Calculation**: Choices affect environment/economic scores and carbon levels
- **Game Over Conditions**: Triggered by low environment scores or high carbon emissions

## Component Architecture
- **Reusable UI Components**: Modular component system with consistent styling
- **Game-specific Components**: 
  - StoryDisplay: Renders scenario content and choices
  - ScoreDashboard: Real-time score visualization
  - PolarBear: Visual indicator of environmental health
  - ChoiceButton: Interactive choice selection with impact indicators
  - GameOverModal: End-game results and restart functionality

## API Structure
- `GET /api/stories/:theme` - Fetch stories for specific theme
- `POST /api/sessions` - Create new game session
- `GET /api/sessions/:id` - Retrieve game session data
- `PATCH /api/sessions/:id` - Update session progress
- `POST /api/sessions/:id/choices` - Record player choices

## Development Tools & Configuration
- **ESBuild**: Production bundling for server-side code
- **PostCSS**: CSS processing with Tailwind CSS integration
- **Replit Integration**: Development environment optimizations for Replit platform
- **TypeScript Configuration**: Shared types between client and server via path mapping

# External Dependencies

## UI & Styling
- **Radix UI**: Accessible component primitives for complex UI components
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating variant-based component APIs

## Data Management
- **TanStack React Query**: Server state management and caching
- **Drizzle ORM**: Type-safe database operations and schema management
- **Neon Database**: Serverless PostgreSQL database service
- **Zod**: Runtime type validation and schema parsing

## Development & Build Tools
- **Vite**: Modern build tool and development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **TypeScript**: Type checking and enhanced developer experience
- **PostCSS & Autoprefixer**: CSS processing and vendor prefixing

## React Ecosystem
- **React Hook Form**: Form state management and validation
- **Wouter**: Lightweight routing solution
- **React Day Picker**: Date selection components
- **Embla Carousel**: Touch-friendly carousel component

## Utility Libraries
- **clsx & tailwind-merge**: Conditional CSS class utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation for sessions and entities