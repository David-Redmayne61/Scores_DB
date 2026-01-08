# Music Scores DB - Quick Reference

## Live Application
**Production URL**: https://lcb-scores.web.app

## Start the Application (Local Development)
```
npm run dev
```
The app will run on http://localhost:3001

## Other Commands
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Deploy to Firebase**: `npm run deploy`

## Firebase Commands
- **Deploy Firestore rules/indexes**: `npx firebase deploy --only firestore`
- **Login to Firebase**: `npx firebase login`

## Application Features
- **Dashboard**: Summary statistics and breakdowns
- **Library**: Full list with sorting, filtering, search
- **CSV Import**: Import scores with duplicate detection
- **CSV Export**: Export all scores to CSV
- **Print**: Print-friendly view of library

## Data Fields
- Title* (required)
- Composer* (required)
- Arranger
- Genre (editable dropdown)
- Genre 2
- Difficulty (1-5)
- Duration (MM:SS format)
- Notes
