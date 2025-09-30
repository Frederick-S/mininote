# Web Note App

A personal web-based note-taking application built with AWS Amplify that allows users to create and organize hierarchical notebooks with markdown-based pages.

## Features

- User authentication with AWS Cognito
- Hierarchical notebook and page organization
- Rich markdown editor with slash commands
- File upload and management
- Search functionality
- Version control for pages
- Export capabilities

## Technology Stack

- **Frontend**: React with TypeScript, Vite
- **UI Library**: Chakra UI
- **State Management**: Zustand
- **Backend**: AWS Amplify Gen 2
- **Database**: Amazon DynamoDB
- **Storage**: Amazon S3
- **Authentication**: Amazon Cognito

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- AWS CLI configured (for deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### AWS Amplify Backend Setup

**Important**: You need AWS credentials configured before deploying the backend.

1. **Configure AWS Credentials** (first time only):
   ```bash
   npm run backend:configure
   ```
   You'll need your AWS Access Key ID, Secret Access Key, and preferred region.

2. **Deploy Backend Services**:
   ```bash
   npm run backend:setup
   ```
   This deploys Authentication, GraphQL API, Database, and File Storage.

3. **Validate Backend Configuration**:
   ```bash
   npm run backend:validate
   ```
   Confirms all services are properly configured.

4. **Start Development**:
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [BACKEND_SETUP.md](./BACKEND_SETUP.md).

## Project Structure

```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── store/         # Zustand state management
├── theme/         # Chakra UI theme configuration
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── App.tsx        # Main application component

amplify/
├── auth/          # Authentication configuration
├── data/          # GraphQL schema and data models
├── storage/       # File storage configuration
└── backend.ts     # Backend configuration
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

### Backend Management
- `npm run backend:configure` - Configure AWS credentials
- `npm run backend:setup` - Deploy backend services
- `npm run backend:validate` - Validate backend configuration

### Amplify (Advanced)
- `npm run amplify:sandbox` - Start Amplify sandbox environment
- `npm run amplify:deploy` - Deploy to production
- `npm run amplify:generate` - Generate Amplify configuration