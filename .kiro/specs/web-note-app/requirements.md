# Requirements Document

## Introduction

A personal web-based note-taking application built with AWS Amplify that allows users to create and organize hierarchical notebooks with markdown-based pages. The application features user authentication, rich text editing with slash commands similar to Notion, file upload capabilities, and comprehensive search functionality across notebooks and pages.

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to sign up and log in to the application, so that I can securely access my personal notes.

#### Acceptance Criteria

1. WHEN a new user visits the application THEN the system SHALL provide a sign-up form with email and password fields
2. WHEN a user submits valid registration information THEN the system SHALL create a new account and send email verification
3. WHEN a user attempts to log in with valid credentials THEN the system SHALL authenticate and grant access to the application
4. WHEN a user attempts to log in with invalid credentials THEN the system SHALL display an appropriate error message
5. WHEN a user is not authenticated THEN the system SHALL redirect them to the login page

### Requirement 2: Notebook Management

**User Story:** As a user, I want to create and manage notebooks, so that I can organize my notes into different categories or projects.

#### Acceptance Criteria

1. WHEN a user is authenticated THEN the system SHALL display a list of their notebooks
2. WHEN a user clicks "Create Notebook" THEN the system SHALL provide a form to enter notebook name and description
3. WHEN a user submits a valid notebook form THEN the system SHALL create the notebook and add it to their collection
4. WHEN a user selects a notebook THEN the system SHALL display the notebook's pages in a hierarchical structure
5. WHEN a user deletes a notebook THEN the system SHALL remove the notebook and all its pages after confirmation

### Requirement 3: Page Management and Hierarchy

**User Story:** As a user, I want to create pages within notebooks with parent-child relationships, so that I can organize my content hierarchically.

#### Acceptance Criteria

1. WHEN a user is viewing a notebook THEN the system SHALL provide an option to create a new page
2. WHEN creating a page THEN the system SHALL allow the user to specify a parent page (optional)
3. WHEN a page has child pages THEN the system SHALL display them in a nested tree structure
4. WHEN a user moves a page THEN the system SHALL update the hierarchy and maintain data integrity
5. WHEN a user deletes a page with children THEN the system SHALL prompt for confirmation and handle child pages appropriately

### Requirement 4: Markdown Content Editing

**User Story:** As a user, I want to edit page content in markdown format with a powerful rich editor, so that I can create well-formatted notes efficiently with advanced content types.

#### Acceptance Criteria

1. WHEN a user opens a page for editing THEN the system SHALL provide a powerful markdown editor with WYSIWYG capabilities
2. WHEN a user types markdown syntax THEN the system SHALL render it appropriately in real-time or preview mode
3. WHEN a user wants to insert a table THEN the system SHALL provide easy table creation with options to add/delete rows and columns
4. WHEN a user wants to add code blocks THEN the system SHALL provide syntax highlighting and language selection
5. WHEN a user wants to add mathematical expressions THEN the system SHALL support LaTeX/MathJax rendering
6. WHEN a user wants to create diagrams THEN the system SHALL support Mermaid chart rendering for flowcharts, sequence diagrams, etc.
7. WHEN a user saves page content THEN the system SHALL store it in markdown format
8. WHEN a user views a page THEN the system SHALL render the markdown content as formatted HTML with proper styling
9. IF a page contains invalid markdown THEN the system SHALL handle it gracefully without breaking the interface

### Requirement 5: Slash Commands for Rich Content

**User Story:** As a user, I want to use slash commands while editing to insert rich content and common markdown formats, so that I can enhance my notes with multimedia content and structured formatting.

#### Acceptance Criteria

1. WHEN a user types "/" in the editor THEN the system SHALL display a command menu with available formatting and content options
2. WHEN a user selects a markdown format command THEN the system SHALL insert appropriate markdown syntax (headings, lists, tables, code blocks, quotes, etc.)
3. WHEN a user selects an upload command THEN the system SHALL open a file picker for images, videos, or documents
4. WHEN a user selects diagram commands THEN the system SHALL insert Mermaid chart templates or math expression blocks
5. WHEN a user uploads a file THEN the system SHALL store it in AWS Amplify storage and insert appropriate markdown
6. WHEN a user pastes an image or file THEN the system SHALL detect the content type and automatically upload it
7. WHEN uploaded files are displayed THEN the system SHALL provide preview capabilities for common file types

### Requirement 6: Search Functionality

**User Story:** As a user, I want to search within the current notebook or across all notebooks, so that I can quickly find specific content.

#### Acceptance Criteria

1. WHEN a user enters a search query THEN the system SHALL provide options to search current notebook or all notebooks
2. WHEN searching within a notebook THEN the system SHALL return matching pages with highlighted results
3. WHEN searching across all notebooks THEN the system SHALL return results grouped by notebook with page references
4. WHEN displaying search results THEN the system SHALL show page titles, notebook names, and content snippets
5. WHEN a user clicks a search result THEN the system SHALL navigate to the specific page and highlight the matching content

### Requirement 7: File Storage and Management

**User Story:** As a user, I want my uploaded files to be securely stored and easily accessible, so that my multimedia content is reliably available.

#### Acceptance Criteria

1. WHEN a user uploads a file THEN the system SHALL store it in AWS Amplify Storage with appropriate permissions
2. WHEN displaying uploaded content THEN the system SHALL generate secure URLs for file access
3. WHEN a file is no longer referenced THEN the system SHALL provide cleanup mechanisms to manage storage
4. WHEN a user deletes a page with files THEN the system SHALL handle associated file cleanup appropriately
5. IF file upload fails THEN the system SHALL display appropriate error messages and retry options

### Requirement 8: User Interface and Experience

**User Story:** As a user, I want an intuitive and responsive interface with rich UI components, so that I can efficiently navigate and use the application.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL provide a desktop-first responsive interface that is also mobile-friendly
2. WHEN navigating between notebooks and pages THEN the system SHALL provide clear visual hierarchy and navigation
3. WHEN performing actions THEN the system SHALL provide appropriate loading states and feedback
4. WHEN errors occur THEN the system SHALL display user-friendly error messages with actionable guidance
5. WHEN using the application THEN the system SHALL maintain consistent styling and interaction patterns throughout

### Requirement 9: Data Security and Privacy

**User Story:** As a user, I want to ensure that only I can access my notebooks and pages, so that my personal notes remain private and secure.

#### Acceptance Criteria

1. WHEN a user is authenticated THEN the system SHALL only display notebooks and pages owned by that user
2. WHEN a user attempts to access another user's content THEN the system SHALL deny access and return appropriate error
3. WHEN performing any data operation THEN the system SHALL verify user ownership before allowing the action
4. WHEN storing user data THEN the system SHALL associate it with the authenticated user's identity
5. WHEN a user logs out THEN the system SHALL clear all cached user data and require re-authentication

### Requirement 10: Export Functionality

**User Story:** As a user, I want to export my notebooks or individual pages as markdown files, so that I can backup my content or use it in other applications.

#### Acceptance Criteria

1. WHEN viewing a notebook THEN the system SHALL provide an option to export the entire notebook as markdown files
2. WHEN viewing a page THEN the system SHALL provide an option to export that specific page as a markdown file
3. WHEN exporting a notebook THEN the system SHALL create a zip file containing all pages as markdown files with proper folder structure
4. WHEN exporting a page THEN the system SHALL generate a markdown file with the page content and appropriate filename
5. WHEN exported files contain references to uploaded media THEN the system SHALL include those files in the export or provide download links

### Requirement 11: Page Version Control

**User Story:** As a user, I want to track versions of my pages and compare different versions, so that I can see the evolution of my content and recover previous versions if needed.

#### Acceptance Criteria

1. WHEN a user saves changes to a page THEN the system SHALL create a new version while preserving the previous version
2. WHEN viewing a page THEN the system SHALL provide access to view all previous versions
3. WHEN selecting two versions THEN the system SHALL provide a comparison view showing differences between versions
4. WHEN a user wants to restore a previous version THEN the system SHALL allow reverting to any previous version
5. WHEN exporting content THEN the system SHALL export only the latest version of each page