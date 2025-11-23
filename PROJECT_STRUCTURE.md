# Project Structure

This document outlines the folder organization for Mini Note.

## Directory Structure

```
web-note-app/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components (Sidebar, Breadcrumb)
│   │   ├── notebook/       # Notebook management components
│   │   ├── page/           # Page management components
│   │   ├── editor/         # Rich text editor components
│   │   ├── search/         # Search components
│   │   └── common/         # Shared/common components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Library configurations and utilities
│   │   └── supabase.ts    # Supabase client configuration
│   ├── store/              # Zustand state management stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── theme/              # Theme configuration
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles with Tailwind
├── public/                 # Static assets
├── .env.example            # Environment variables template
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Directories

### `/src/components`
Contains all React components organized by feature:
- **auth/**: Login, signup, and authentication-related components
- **layout/**: Application layout components (sidebar, navigation, breadcrumbs)
- **notebook/**: Notebook list, creator, and management components
- **page/**: Page CRUD and hierarchy components
- **editor/**: TipTap editor and related components
- **search/**: Search bar and results components
- **common/**: Reusable UI components (buttons, modals, etc.)

### `/src/hooks`
Custom React hooks for:
- Data fetching and mutations
- Authentication state
- Form validation
- Editor functionality

### `/src/lib`
Library configurations and integrations:
- Supabase client setup
- Third-party library configurations

### `/src/store`
Zustand stores for global state management:
- Authentication state
- UI state
- Cache management

### `/src/types`
TypeScript type definitions and interfaces

### `/src/utils`
Utility functions for:
- Data formatting
- Validation
- Error handling
- Export functionality

## Configuration Files

- **tailwind.config.js**: Tailwind CSS customization
- **postcss.config.js**: PostCSS plugins configuration
- **vite.config.ts**: Vite build tool configuration
- **tsconfig.json**: TypeScript compiler options
- **.env.example**: Template for environment variables

## Environment Variables

Required environment variables (see `.env.example`):
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
