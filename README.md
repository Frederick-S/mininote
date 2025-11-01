# Web Note App [![Node.js CI](https://github.com/Frederick-S/mininote/actions/workflows/node.js.yml/badge.svg)](https://github.com/Frederick-S/mininote/actions/workflows/node.js.yml)

A personal web-based note-taking application built with React, TypeScript, Supabase, and Tailwind CSS. Create and organize hierarchical notebooks with markdown-based pages, featuring rich text editing, file uploads, and comprehensive search functionality.

## Features

- 🔐 User authentication with Supabase Auth
- 📚 Hierarchical notebook and page organization
- ✍️ Rich markdown editor with TipTap
- 🔍 Full-text search across notebooks and pages
- 📎 File upload and management with Supabase Storage
- 📝 Page version control and history
- 📤 Export notebooks and pages as markdown files
- 🎨 Modern, responsive UI with Tailwind CSS

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand
- **Rich Text Editor**: TipTap (to be integrated)

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd web-note-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up your Supabase backend:
   - Follow the comprehensive guide in [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
   - Or run the SQL script: Execute `supabase-setup.sql` in your Supabase SQL Editor
   - Configure Storage bucket and policies as described in the guide

5. Start the development server:
```bash
npm run dev
```

## Project Structure

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed information about the folder organization.

```
src/
├── components/     # React components organized by feature
├── hooks/          # Custom React hooks
├── lib/            # Library configurations (Supabase)
├── store/          # Zustand state management
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── theme/          # Theme configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Documentation

- [Requirements](./.kiro/specs/web-note-app/requirements.md)
- [Design Document](./.kiro/specs/web-note-app/design.md)
- [Implementation Tasks](./.kiro/specs/web-note-app/tasks.md)

## License

MIT
