# LCB Music Scores Database

A cloud-based music score management system for the Ludlow Concert Band (LCB), built with React and Firebase.

## Live Application

**Production URL**: https://lcb-scores.web.app

## Overview

This application provides a comprehensive database for managing the band's music score library. It allows band members to catalog, search, filter, and organize their music collection with cloud synchronization across all devices.

## Features

### Core Functionality
- **User Authentication**: Secure login/signup with email and password via Firebase Authentication
- **Score Management**: Full CRUD operations for music scores
- **Cloud Storage**: All data stored in Firebase Firestore with real-time synchronization
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Dashboard
- Total score count
- Recent additions (last 24 hours)
- Last added score information
- Last edited score information
- Genre breakdown with counts
- Difficulty level distribution
- LCB band logo display

### Library View
- **Alphabetical Index**: Quick navigation with clickable A-Z buttons
- **Letter Grouping**: Scores organized by first letter with visual section headers
  - Titles starting with numbers grouped under "#"
  - Automatically adapts based on sort field (title or composer)
- Sortable table columns (Title, Composer, Arranger, Genre, Difficulty, Duration, Notes)
- Advanced filtering by genre and difficulty
- Search functionality with wildcard support:
  - `*` matches any number of characters
  - `?` matches single character
  - Example: `bach*` finds all Bach pieces
- Sticky table header (remains visible while scrolling)
- Add, edit, and delete scores
- "Save & Add Another" workflow for bulk entry
- Auto-focus on Title field when adding new scores

### Data Import/Export
- **CSV Import**: 
  - Bulk import scores from CSV files
  - Duplicate detection (case-insensitive by title)
  - Option to skip or import duplicates
  - Import summary report
- **CSV Export**: Export entire library to CSV format
- **Print to PDF**: Print-friendly view with LCB logo and title

### Genre Management
- Editable genre dropdown with default options:
  - Classical, Musicals, Film, March, Dance, Latin, Pop, Christmas, Remembrance
- Custom genre creation stored in Firestore
- Global genre list shared across all users
- Automatic migration from localStorage to Firestore
- Primary and secondary genre fields

## Tech Stack

- **Frontend**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Backend**: Firebase 10.7.1
  - Firebase Authentication (Email/Password)
  - Cloud Firestore (NoSQL database)
  - Firebase Hosting
- **Routing**: React Router DOM 6.20.0
- **Styling**: Custom CSS (no framework)

## Project Structure

```
Scores_DB/
├── src/
│   ├── components/
│   │   ├── Navigation.jsx       # Main navigation bar
│   │   ├── PrivateRoute.jsx     # Protected route wrapper
│   │   └── ScoreForm.jsx        # Reusable form for add/edit
│   ├── contexts/
│   │   └── AuthContext.jsx      # Authentication context provider
│   ├── pages/
│   │   ├── Dashboard.jsx        # Summary statistics view
│   │   ├── Library.jsx          # Full library with table
│   │   ├── Login.jsx            # Login page
│   │   └── Signup.jsx           # Registration page
│   ├── services/
│   │   ├── genreService.js      # Genre CRUD operations
│   │   └── scoreService.js      # Score CRUD operations
│   ├── Resources/
│   │   ├── LCB.png              # Band logo
│   │   └── COMMANDS.md          # Quick reference guide
│   ├── App.jsx                  # Main app component with routes
│   ├── firebase.js              # Firebase configuration
│   ├── index.css                # Global styles
│   └── main.jsx                 # App entry point
├── firebase.json                # Firebase hosting config
├── firestore.indexes.json       # Firestore indexes
├── firestore.rules              # Security rules
├── vite.config.js               # Vite configuration
└── package.json                 # Dependencies
```

## Data Structure

### Score Fields
- **Title*** (required): Name of the musical piece
- **Composer*** (required): Composer name
- **Arranger**: Arranger name (optional)
- **Genre**: Primary genre from dropdown or custom
- **Genre 2**: Secondary genre (optional)
- **Difficulty**: Rating from 1-5
- **Duration**: Length in MM:SS format
- **Notes**: Additional information (optional)

### Firestore Collections
- `scores`: User scores with userId field for data isolation
- `genres`: Global genre list (document ID: "global-genres")
- `users`: User profile data

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- Firebase account and project
- Git

### Local Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd Scores_DB
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Email/Password Authentication
   - Create a Firestore database
   - Add your Firebase config to `src/firebase.js`

4. Deploy Firestore security rules and indexes:
```bash
npx firebase login
npx firebase deploy --only firestore
```

5. Start development server:
```bash
npm run dev
```
   The app will run at http://localhost:3001

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npx firebase deploy --only hosting
```

### Quick Deploy (Build + Deploy)
```bash
npm run deploy
```

## Firebase Configuration

### Authentication
- Method: Email/Password
- Configured in Firebase Console under Authentication > Sign-in method

### Firestore Security Rules
- Users can only read/write their own scores
- All authenticated users can read/write to the global genres collection
- Rules defined in `firestore.rules`

### Firestore Indexes
- Composite index on `userId` + `createdAt` for efficient score queries
- Defined in `firestore.indexes.json`

## Usage Guide

### Adding Scores
1. Navigate to Library view
2. Click "+ Add Score"
3. Fill in required fields (Title, Composer)
4. Use "Save & Close" or "Save & Add Another" for bulk entry

### Importing Scores
1. Prepare a CSV file with columns: Title, Composer, Arranger, Genre, Genre 2, Difficulty, Duration, Notes
2. Click "Import CSV" in Library view
3. Select your file
4. Choose whether to skip or import duplicates
5. Review the import summary

### Adding Custom Genres
1. Open the score form
2. Select "+ Add New Genre" from the Genre dropdown
3. Enter the new genre name
4. Click "Add"
5. The genre is now available to all users globally

### Searching with Wildcards
- `*march*` - Finds any title containing "march"
- `john*` - Finds composers starting with "john"
- `????` - Finds 4-character titles

### Printing
1. Click "Print" in Library view
2. The print preview shows:
   - LCB logo and title header
   - Clean table layout without UI elements
   - Letter sections flow naturally across pages
   - Optimized for A4 paper with proper page breaks

## Development Notes

### Port Configuration
- Default development port: 3001 (configured in `vite.config.js`)
- Automatically tries another port if 3001 is in use

### CSV Format
- First row should be headers
- Handles quoted fields with commas
- Case-insensitive duplicate detection by title

### Browser Compatibility
- Tested on Chrome, Edge, Firefox, Safari
- Sticky table headers work best in modern browsers
- Print functionality optimized for Chrome/Edge

## Future Enhancements

Potential features for consideration:
- Advanced search with multiple field filters
- Score file attachments (PDF storage)
- Practice session tracking
- Concert program builder
- Mobile app version
- Bulk edit operations
- Archive/restore functionality

## Support

For questions or issues, contact the project maintainer.

## License

Private project for Ludlow Concert Band internal use.

---

Built with ❤️ for LCB
