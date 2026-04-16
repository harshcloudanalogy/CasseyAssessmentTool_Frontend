# Overview

This is a full-stack web application for educational assessment validation built with React, TypeScript, Express.js, and PostgreSQL. The application appears to be designed for uploading and validating educational assessment documents against compliance standards. It features a modern UI built with shadcn/ui components and Tailwind CSS, with a RESTful API backend that handles file uploads, user authentication, and validation reporting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers

## Backend Architecture
- **Runtime**: Node.js with TypeScript using ESM modules
- **Framework**: Express.js for RESTful API endpoints
- **File Processing**: Multer middleware for handling multipart file uploads with size and type validation
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Development**: Hot reloading with tsx for TypeScript execution

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Database Provider**: Neon Database serverless PostgreSQL
- **Storage Implementation**: Dual storage strategy with in-memory storage for development and PostgreSQL for production

## Authentication and Authorization
- **Authentication Method**: Email/password-based authentication with session management
- **User Management**: User registration and login with encrypted password storage
- **Session Storage**: PostgreSQL-backed sessions for persistence across server restarts
- **Demo Access**: Pre-configured demo user (admin@eduvalidate.com) for testing

## File Upload and Processing
- **Upload Strategy**: Server-side file handling with configurable upload directory
- **File Validation**: Strict file type filtering (PDF, DOC, DOCX, TXT) with 10MB size limit
- **File Metadata**: Tracking of original filenames, file sizes, and upload paths
- **Assessment Categories**: Support for competency unit categorization

## API Structure
- **Authentication Endpoints**: `/api/auth/login` for user authentication
- **File Upload Endpoints**: Protected routes for assessment document uploads
- **Validation Endpoints**: API routes for generating and retrieving compliance reports
- **Error Handling**: Centralized error middleware with standardized JSON responses

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect support

## UI and Styling
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for managing component variants

## Development and Build Tools
- **Vite**: Fast build tool with React plugin and runtime error overlay
- **TypeScript**: Static type checking with strict configuration
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment plugins for Replit platform

## Form and Data Handling
- **React Hook Form**: Performant form library with validation support
- **Zod**: Schema validation library for runtime type checking
- **TanStack Query**: Data fetching and caching solution

## File Processing
- **Multer**: Express middleware for handling multipart/form-data uploads
- **Date-fns**: Date utility library for timestamp handling

## Session and Security
- **Connect-PG-Simple**: PostgreSQL session store for Express sessions
- **Express Rate Limiting**: Built-in security middleware for request throttling