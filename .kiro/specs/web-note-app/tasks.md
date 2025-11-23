# Implementation Plan

- [x] 1. Set up project foundation and Supabase configuration
  - Initialize React TypeScript project with Vite
  - Install and configure Supabase client library
  - Set up Tailwind CSS for styling
  - Configure project structure with proper folder organization
  - _Requirements: 1.1, 8.1, 9.1_

- [x] 2. Configure Supabase backend services
  - Create Supabase project and obtain credentials
  - Set up PostgreSQL database schema with tables
  - Configure Row Level Security (RLS) policies
  - Set up Supabase Storage bucket for file uploads
  - Create database triggers for search and timestamps
  - _Requirements: 1.1, 1.2, 7.1, 9.1_

- [x] 3. Implement authentication system
- [x] 3.1 Create authentication components and forms
  - Build SignUpForm component with email/password validation
  - Build LoginForm component with error handling
  - Create AuthGuard component for route protection
  - Implement email verification flow
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 3.2 Set up authentication state management
  - Create Zustand store for authentication state
  - Implement login/logout/signup actions with Supabase Auth
  - Add authentication persistence and session management
  - Handle authentication errors and edge cases
  - _Requirements: 1.3, 1.5, 9.5_

- [x] 4. Create database access layer
- [x] 4.1 Set up Supabase client and types
  - Configure Supabase client with environment variables
  - Generate TypeScript types from database schema
  - Create database helper functions and utilities
  - Set up error handling for database operations
  - _Requirements: 2.1, 3.1, 3.2, 7.1, 9.1, 9.3, 11.1_

- [x] 4.2 Implement data access hooks
  - Create custom hooks for notebook operations (CRUD)
  - Build hooks for page operations with hierarchy support
  - Implement hooks for page version management
  - Add hooks for attachment operations
  - Implement optimistic updates and caching
  - _Requirements: 2.2, 2.3, 3.3, 9.2, 9.3_

- [x] 5. Build core navigation and layout components
- [x] 5.1 Create application layout and navigation
  - Build responsive Sidebar component with notebook tree
  - Create Breadcrumb navigation component
  - Implement NotebookTree with hierarchical display
  - Add mobile-friendly navigation drawer
  - _Requirements: 8.1, 8.2, 8.5_

- [x] 5.2 Implement notebook management interface
  - Create NotebookList component with grid/list view
  - Build NotebookCreator form with validation
  - Add notebook deletion with confirmation dialog
  - Implement notebook selection and navigation
  - _Requirements: 2.1, 2.2, 2.3, 2.5_

- [x] 6. Implement page management and hierarchy
- [x] 6.1 Create page CRUD operations
  - Build page creation form with parent page selection
  - Implement page editing interface
  - Add page deletion with child page handling
  - Create page move/reorganization functionality
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 6.2 Build hierarchical page display
  - Create nested tree structure for pages
  - Implement expand/collapse functionality
  - Add drag-and-drop for page reorganization
  - Build page navigation and selection
  - _Requirements: 3.2, 3.3, 3.4_

- [x] 7. Implement rich markdown editor with TipTap
- [x] 7.1 Set up TipTap editor with basic functionality
  - Install and configure TipTap with React
  - Create PageEditor component with markdown support
  - Implement real-time preview or WYSIWYG mode
  - Add basic formatting toolbar
  - _Requirements: 4.1, 4.2, 4.7, 4.8_

- [x] 7.2 Add advanced editor features
  - Implement table creation and editing (add/delete rows/columns)
  - Add code block support with syntax highlighting
  - Integrate MathJax for mathematical expressions
  - Add Mermaid diagram support for flowcharts
  - _Requirements: 4.3, 4.4, 4.5, 4.6_

- [x] 7.3 Implement slash commands system
  - Create SlashCommandMenu component
  - Add markdown formatting commands (headings, lists, quotes)
  - Implement table and code block insertion commands
  - Add diagram and math expression commands
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 8. Build file upload and management system
- [ ] 8.1 Implement file upload functionality
  - Create FileUploader component with drag-and-drop support
  - Add file type validation and size limits (images, videos, documents)
  - Implement progress tracking for uploads to Supabase Storage
  - Build file preview capabilities for common file types
  - Generate secure URLs for uploaded files
  - _Requirements: 5.3, 5.6, 5.7, 7.1, 7.2_

- [ ] 8.2 Integrate auto-upload with editor
  - Implement paste event detection in TipTap editor for images and files
  - Add automatic file upload on paste/drop with progress indicator
  - Create automatic markdown insertion for uploaded files (images as ![alt](url), files as [filename](url))
  - Add drag-and-drop file upload directly into editor
  - Handle multiple file uploads simultaneously
  - _Requirements: 5.3, 5.5, 5.6, 7.3, 7.4_

- [ ] 8.3 Add file upload slash commands
  - Implement /image, /file, /video slash commands
  - Open file picker on command selection
  - Auto-upload selected files and insert markdown
  - Show upload progress in editor
  - _Requirements: 5.3, 5.5, 5.6_

- [ ] 8.4 Implement file management capabilities
  - Track file attachments in attachments table
  - Add file deletion when removed from page content
  - Implement orphaned file cleanup mechanism
  - Handle file cleanup when pages are deleted
  - _Requirements: 7.3, 7.4_

- [x] 9. Implement page version control system
- [x] 9.1 Create version tracking functionality
  - Implement automatic version creation on page save
  - Build version storage using page_versions table
  - Add version numbering and metadata tracking
  - Create version cleanup and management
  - _Requirements: 11.1, 11.2_

- [x] 9.2 Build version history interface
  - Create VersionHistory component listing all versions
  - Implement version selection and viewing
  - Add version restoration functionality
  - Build VersionComparison component for diff viewing
  - _Requirements: 11.2, 11.3, 11.4_

- [x] 10. Implement search functionality
- [x] 10.1 Create search infrastructure
  - Implement PostgreSQL full-text search queries
  - Add search scope selection (current notebook vs all)
  - Create search result ranking using ts_rank
  - Implement search highlighting in results
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10.2 Build search user interface
  - Create SearchBar component with scope selection
  - Build SearchResults component with highlighting
  - Implement search filters and sorting options
  - Add search result navigation and preview
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

- [ ] 11. Implement export functionality
- [ ] 11.1 Create single page export
  - Build markdown file generation for individual pages
  - Implement file download functionality
  - Add proper filename generation and formatting
  - Handle embedded media in exports
  - _Requirements: 10.2, 10.4, 11.5_

- [ ] 11.2 Create notebook export system
  - Implement full notebook export as zip file
  - Create proper folder structure for exported content
  - Add media file inclusion in exports
  - Build export progress tracking and feedback
  - _Requirements: 10.1, 10.3, 10.5_

- [ ] 12. Implement markdown import with hierarchy and asset management
- [ ] 12.1 Create import service infrastructure
  - Build MarkdownImportService class with file tree parsing
  - Implement recursive folder scanning for markdown files
  - Create asset reference extraction using regex patterns
  - Add path resolution for relative asset references
  - _Requirements: 12.2, 12.3, 12.6_

- [ ] 12.2 Implement asset upload and URL replacement
  - Create asset file finder using webkitRelativePath
  - Implement asset upload to Supabase Storage
  - Build markdown content updater to replace local paths with URLs
  - Add error handling for missing or failed asset uploads
  - _Requirements: 12.6, 12.8_

- [ ] 12.3 Build page hierarchy creation logic
  - Implement page creation plan builder from file tree
  - Create pages with proper parent-child relationships
  - Maintain path-to-pageId mapping for hierarchy
  - Handle nested folder structures correctly
  - _Requirements: 12.4, 12.5_

- [ ] 12.4 Create import UI components
  - Build ImportDialog component with file/folder selection tabs
  - Create FileDropzone component with drag-and-drop support
  - Implement folder traversal using File System Access API
  - Add webkitdirectory fallback for folder selection
  - _Requirements: 12.1, 12.3_

- [ ] 12.5 Add import progress tracking and feedback
  - Implement progress calculation for asset uploads and page creation
  - Create progress callback system with percentage updates
  - Build ImportSummaryDialog showing pages created and assets uploaded
  - Display errors for missing assets or failed operations
  - _Requirements: 12.7, 12.8, 12.9_

- [ ] 12.5.1 Handle encrypted notebook imports
  - Detect if target notebook is encrypted before import
  - Prompt for notebook encryption password if needed
  - Verify password by attempting to decrypt notebook metadata
  - Encrypt all imported page content with notebook password
  - Update import summary to indicate encrypted import
  - Handle password verification errors and cancel import if needed
  - _Requirements: 12.10, 13.2, 13.8_

- [ ] 12.6 Write property test for single file import
  - **Property 1: Single file import creates matching page**
  - **Validates: Requirements 12.2**

- [ ] 12.7 Write property test for folder scanning
  - **Property 2: Folder scan discovers all markdown files**
  - **Validates: Requirements 12.3**

- [ ] 12.8 Write property test for folder hierarchy
  - **Property 3: Folder import preserves hierarchy**
  - **Validates: Requirements 12.4**

- [ ] 12.9 Write property test for nested hierarchy
  - **Property 4: Nested folder hierarchy preservation**
  - **Validates: Requirements 12.5**

- [ ] 12.10 Write property test for asset handling
  - **Property 5: Asset references are detected and uploaded**
  - **Validates: Requirements 12.6**

- [ ] 12.11 Write property test for import progress
  - **Property 6: Import progress is reported**
  - **Validates: Requirements 12.7**

- [ ] 12.12 Write property test for error handling
  - **Property 7: Missing assets don't block import**
  - **Validates: Requirements 12.8**

- [ ] 12.13 Write property test for import summary
  - **Property 8: Import summary accuracy**
  - **Validates: Requirements 12.9**

- [ ] 12.14 Write property test for encrypted notebook import
  - **Property 15: Import into encrypted notebook encrypts pages**
  - **Validates: Requirements 12.10**

- [ ] 13. Implement content encryption system
- [ ] 13.1 Update database schema for encryption
  - Add is_encrypted, encryption_salt, encryption_iv columns to notebooks table
  - Add is_encrypted, encryption_salt, encryption_iv, encrypted_content columns to pages table
  - Update searchable_content trigger to skip encrypted pages
  - Run database migration to apply schema changes
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.10_

- [ ] 13.2 Create encryption service with Web Crypto API
  - Build EncryptionService class with AES-256-GCM encryption
  - Implement PBKDF2 key derivation with 100,000 iterations
  - Add encrypt method that generates salt, IV, and ciphertext
  - Add decrypt method with error handling for wrong passwords
  - Implement password validation with strength requirements
  - Add utility methods for base64 encoding/decoding
  - _Requirements: 13.4, 13.6, 13.7, 13.10_

- [ ] 13.3 Write property test for encryption ciphertext generation
  - **Property 9: Encryption produces ciphertext**
  - **Validates: Requirements 13.4**

- [ ] 13.4 Write property test for encryption round-trip
  - **Property 10: Encryption round-trip preserves content**
  - **Validates: Requirements 13.6**

- [ ] 13.5 Write property test for wrong password handling
  - **Property 11: Wrong password fails decryption**
  - **Validates: Requirements 13.7**

- [ ] 13.6 Create password management UI components
  - Build EncryptionPasswordDialog component with set/unlock modes
  - Create password input fields with confirmation for setting
  - Add password strength indicator and validation feedback
  - Implement error display for incorrect passwords
  - Add warning message about password recovery
  - _Requirements: 13.1, 13.3, 13.5, 13.6, 13.7_

- [ ] 13.7 Implement password caching service
  - Create PasswordCacheService with session-based storage
  - Add 30-minute expiration for cached passwords
  - Implement cache retrieval and validation
  - Add cache clearing on logout or timeout
  - _Requirements: 13.5, 13.6_

- [ ] 13.8 Build encryption toggle component
  - Create EncryptionToggle component with Switch UI
  - Add visual indicator (lock icon) for encrypted content
  - Trigger password dialog when enabling encryption
  - Handle encryption state changes
  - _Requirements: 13.1, 13.3_

- [ ] 13.9 Implement page-level encryption
  - Create PageEncryptionService class
  - Add savePage method that encrypts content before storing
  - Implement loadPage method that decrypts content on retrieval
  - Handle password prompts for encrypted pages
  - Clear plaintext content field when encrypting
  - _Requirements: 13.3, 13.4, 13.5, 13.6, 13.7, 13.9, 13.10_

- [ ] 13.10 Write property test for database plaintext prevention
  - **Property 13: Database never stores plaintext for encrypted content**
  - **Validates: Requirements 13.10**

- [ ] 13.11 Write property test for page-specific encryption override
  - **Property 14: Page-specific encryption overrides notebook encryption**
  - **Validates: Requirements 13.9**

- [ ] 13.12 Implement notebook-level encryption
  - Create NotebookEncryptionService class
  - Add enableNotebookEncryption method that encrypts all pages
  - Implement disableNotebookEncryption with password verification
  - Handle encryption cascade to all child pages
  - Update notebook metadata with encryption status
  - _Requirements: 13.1, 13.2, 13.8_

- [ ] 13.13 Write property test for notebook encryption cascade
  - **Property 12: Notebook encryption cascades to pages**
  - **Validates: Requirements 13.8**

- [ ] 13.14 Integrate encryption with editor
  - Add encryption toggle to page editor interface
  - Implement automatic decryption when opening encrypted pages
  - Add password prompt before displaying encrypted content
  - Handle encryption state changes during editing
  - Update save functionality to encrypt when needed
  - _Requirements: 13.3, 13.4, 13.5, 13.6_

- [ ] 13.15 Update search to exclude encrypted content
  - Modify search queries to filter out encrypted pages
  - Add visual badge for encrypted pages in search results
  - Update searchable_content trigger to skip encrypted pages
  - _Requirements: 13.4, 13.10_

- [ ] 13.16 Update export functionality for encrypted content
  - Detect encrypted notebooks/pages during export
  - Prompt user for encryption password before export
  - Decrypt all encrypted content before generating export files
  - Export decrypted content as plaintext markdown
  - Handle incorrect password errors and cancel export
  - _Requirements: 10.6, 13.4, 13.6_

- [ ] 14. Add comprehensive error handling and loading states
- [ ] 14.1 Implement global error handling
  - Create ErrorBoundary components for error catching
  - Build user-friendly error message system
  - Add retry mechanisms for failed operations
  - Implement error logging and monitoring
  - _Requirements: 8.4, 9.2_

- [ ] 14.2 Add loading states and user feedback
  - Create loading spinners and skeleton screens
  - Implement progress indicators for long operations
  - Add success/error toast notifications
  - Build offline state handling
  - _Requirements: 8.3, 8.4_

- [ ] 15. Implement responsive design and mobile optimization
- [ ] 15.1 Optimize for mobile devices
  - Ensure responsive layout across all screen sizes
  - Implement touch-friendly interactions
  - Add mobile-specific navigation patterns
  - Optimize editor for mobile input
  - _Requirements: 8.1, 8.5_

- [ ] 15.2 Add accessibility features
  - Implement keyboard navigation throughout the app
  - Add proper ARIA labels and semantic HTML
  - Ensure color contrast and screen reader compatibility
  - Test with accessibility tools and guidelines
  - _Requirements: 8.5_

- [ ] 16. Write comprehensive tests
- [ ] 16.1 Create unit tests for components and utilities
  - Write tests for all React components
  - Test custom hooks and utility functions
  - Mock Supabase client for testing
  - Achieve high test coverage for critical paths
  - _Requirements: All requirements validation_

- [ ] 16.2 Implement integration and end-to-end tests
  - Create integration tests for user workflows
  - Build end-to-end tests with Playwright
  - Test file upload and download functionality
  - Validate cross-browser compatibility
  - _Requirements: Complete user journey validation_

- [ ] 17. Performance optimization and deployment preparation
- [ ] 17.1 Optimize application performance
  - Implement code splitting and lazy loading
  - Optimize bundle size and loading times
  - Add performance monitoring and metrics
  - Optimize database queries and indexes
  - _Requirements: 8.1, 8.3_

- [ ] 17.2 Prepare for production deployment
  - Configure production environment variables
  - Set up CI/CD pipeline for automated deployment
  - Configure monitoring and logging
  - Perform security audit and testing
  - Deploy to Vercel or Netlify
  - _Requirements: 9.1, 9.2, 9.3, 9.4_
