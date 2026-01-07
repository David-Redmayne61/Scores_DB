# Music Scores Database

A web application for managing and organizing music scores using React and Firebase.

## Features

- User authentication (sign up, sign in, sign out)
- Add, view, edit, and delete music scores
- Store score metadata: title, composer, genre, difficulty, etc.
- Cloud-based storage with Firebase Firestore
- Responsive design

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy your Firebase config from Project Settings
5. Create a `.env` file based on `.env.example` and add your Firebase credentials

### 3. Initialize Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Select:
- Firestore
- Hosting

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment

```bash
npm run deploy
```

This will build the project and deploy it to Firebase Hosting.

## Project Structure

```
src/
├── components/          # React components
├── services/           # Firebase service functions
├── contexts/           # React contexts (Auth, etc.)
├── pages/              # Page components
├── App.jsx             # Main app component
└── main.jsx           # Entry point
```

## Firebase Collections

### scores
- `id`: auto-generated
- `title`: string
- `composer`: string
- `genre`: string
- `instrument`: string
- `difficulty`: string
- `year`: number
- `publisher`: string
- `notes`: string
- `userId`: string (owner)
- `createdAt`: timestamp
- `updatedAt`: timestamp
