# Backend Architecture Overview

Visual overview of the Supabase backend architecture for the Web Note App.

## System Architecture

```mermaid
graph TB
    subgraph "Client Application"
        A[React App]
        B[Supabase Client]
    end
    
    subgraph "Supabase Backend"
        C[Supabase Auth]
        D[PostgreSQL Database]
        E[Supabase Storage]
        F[Row Level Security]
    end
    
    subgraph "Database Tables"
        G[notebooks]
        H[pages]
        I[page_versions]
        J[attachments]
    end
    
    A --> B
    B --> C
    B --> D
    B --> E
    C --> F
    D --> F
    D --> G
    D --> H
    D --> I
    D --> J
```

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ NOTEBOOKS : owns
    USERS ||--o{ PAGES : owns
    USERS ||--o{ PAGE_VERSIONS : owns
    USERS ||--o{ ATTACHMENTS : owns
    NOTEBOOKS ||--o{ PAGES : contains
    PAGES ||--o{ PAGES : "parent of"
    PAGES ||--o{ PAGE_VERSIONS : "has versions"
    PAGES ||--o{ ATTACHMENTS : "has files"
    
    USERS {
        uuid id PK
        string email
        timestamp created_at
    }
    
    NOTEBOOKS {
        uuid id PK
        string title
        string description
        uuid user_id FK
        timestamp created_at
        timestamp updated_at
    }
    
    PAGES {
        uuid id PK
        string title
        text content
        int version
        uuid parent_page_id FK
        uuid notebook_id FK
        uuid user_id FK
        tsvector searchable_content
        timestamp created_at
        timestamp updated_at
    }
    
    PAGE_VERSIONS {
        uuid id PK
        uuid page_id FK
        string title
        text content
        int version
        uuid user_id FK
        timestamp created_at
    }
    
    ATTACHMENTS {
        uuid id PK
        string filename
        string file_type
        int file_size
        string storage_path
        uuid page_id FK
        uuid user_id FK
        timestamp created_at
    }
```

## Data Flow

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as React App
    participant SA as Supabase Auth
    participant DB as Database
    
    U->>A: Sign Up / Login
    A->>SA: Authenticate
    SA->>SA: Verify Credentials
    SA-->>A: Return JWT Token
    A->>A: Store Session
    A->>DB: Query with JWT
    DB->>DB: Verify via RLS
    DB-->>A: Return User Data
```

### Page Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as React App
    participant DB as Database
    participant T as Triggers
    
    U->>A: Create Page
    A->>DB: INSERT into pages
    DB->>T: Fire Triggers
    T->>T: Update searchable_content
    T->>T: Set timestamps
    DB-->>A: Return New Page
    A-->>U: Show Success
```

### File Upload Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as React App
    participant S as Supabase Storage
    participant DB as Database
    
    U->>A: Upload File
    A->>S: Upload to user-files/{user_id}/{page_id}/
    S->>S: Verify Storage Policy
    S-->>A: Return Storage Path
    A->>DB: INSERT into attachments
    DB-->>A: Return Attachment Record
    A-->>U: Show File in Editor
```

### Search Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as React App
    participant DB as Database
    participant FTS as Full-Text Search
    
    U->>A: Enter Search Query
    A->>DB: Query with ts_query
    DB->>FTS: Search searchable_content
    FTS->>FTS: Rank Results
    FTS-->>DB: Return Matches
    DB-->>A: Return Ranked Results
    A-->>U: Display Results
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[User Authentication]
        B[JWT Token]
        C[Row Level Security]
        D[Storage Policies]
    end
    
    subgraph "Data Access"
        E[User Request]
        F[Authenticated Request]
        G[RLS Check]
        H[Data Access]
    end
    
    E --> A
    A --> B
    B --> F
    F --> C
    C --> G
    G --> H
    
    F --> D
    D --> H
```

## RLS Policy Structure

### Notebooks Table Policies

```sql
-- SELECT: View own notebooks
auth.uid() = user_id

-- INSERT: Create own notebooks
auth.uid() = user_id

-- UPDATE: Update own notebooks
auth.uid() = user_id

-- DELETE: Delete own notebooks
auth.uid() = user_id
```

### Pages Table Policies

```sql
-- SELECT: View own pages
auth.uid() = user_id

-- INSERT: Create own pages
auth.uid() = user_id

-- UPDATE: Update own pages
auth.uid() = user_id

-- DELETE: Delete own pages
auth.uid() = user_id
```

### Storage Policies

```sql
-- All operations check:
bucket_id = 'user-files' 
AND 
auth.uid()::text = (storage.foldername(name))[1]
```

## Trigger Architecture

### Automatic Timestamp Updates

```mermaid
graph LR
    A[UPDATE notebooks/pages] --> B[Trigger: update_updated_at]
    B --> C[Set updated_at = NOW]
    C --> D[Return Modified Row]
```

### Full-Text Search Index

```mermaid
graph LR
    A[INSERT/UPDATE pages] --> B[Trigger: update_searchable_content]
    B --> C[Generate tsvector from title + content]
    C --> D[Store in searchable_content]
    D --> E[Return Modified Row]
```

## Storage Structure

```
user-files/ (Bucket)
│
├── {user_id_1}/
│   ├── {page_id_1}/
│   │   ├── image1.png
│   │   ├── document.pdf
│   │   └── video.mp4
│   │
│   └── {page_id_2}/
│       └── diagram.svg
│
└── {user_id_2}/
    └── {page_id_3}/
        └── attachment.zip
```

## Performance Optimizations

### Indexes

```sql
-- Foreign key indexes
idx_notebooks_user_id
idx_pages_notebook_id
idx_pages_parent_page_id
idx_pages_user_id
idx_page_versions_page_id
idx_attachments_page_id

-- Full-text search index
idx_pages_searchable_content (GIN)
```

### Query Optimization

1. **User Data Queries**: Filtered by `user_id` index
2. **Notebook Pages**: Filtered by `notebook_id` index
3. **Page Hierarchy**: Filtered by `parent_page_id` index
4. **Search**: Uses GIN index on `searchable_content`

## Scalability Considerations

### Database
- Indexes on all foreign keys
- RLS policies prevent full table scans
- Efficient full-text search with GIN indexes

### Storage
- User-specific folders prevent conflicts
- Private bucket with policy-based access
- Supports large file uploads (configurable limit)

### Authentication
- JWT-based stateless authentication
- Session management handled by Supabase
- Automatic token refresh

## Backup and Recovery

### Automatic Backups
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Backup retention based on plan

### Data Export
- Users can export their notebooks
- Markdown format for portability
- Includes file attachments

## Monitoring and Logging

### Available Metrics
- Database query performance
- Storage usage per user
- Authentication events
- API request logs

### Access Logs
- All queries logged by Supabase
- Storage access tracked
- Authentication attempts recorded

---

**Architecture Status:** ✅ Fully Designed and Documented  
**Implementation Status:** 🟡 Ready for Setup  
**Next Step:** Follow [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
