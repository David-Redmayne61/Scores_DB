import { db } from '../firebase';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore';

const GENRES_DOC_ID = 'global-genres';

const defaultGenres = [
  'Classical',
  'Musicals',
  'Film',
  'March',
  'Dance',
  'Latin',
  'Pop',
  'Christmas',
  'Remembrance'
];

export async function getGenres() {
  try {
    const docRef = doc(db, 'genres', GENRES_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().list || defaultGenres;
    } else {
      // Initialize with default genres
      await setDoc(docRef, { list: defaultGenres });
      return defaultGenres;
    }
  } catch (error) {
    console.error('Error getting genres:', error);
    return defaultGenres;
  }
}

export async function addGenre(newGenre) {
  try {
    const currentGenres = await getGenres();
    
    // Check if genre already exists (case-insensitive)
    if (currentGenres.some(g => g.toLowerCase() === newGenre.toLowerCase())) {
      return { success: false, message: 'Genre already exists' };
    }
    
    const updatedGenres = [...currentGenres, newGenre].sort();
    const docRef = doc(db, 'genres', GENRES_DOC_ID);
    await setDoc(docRef, { list: updatedGenres });
    
    return { success: true, genres: updatedGenres };
  } catch (error) {
    console.error('Error adding genre:', error);
    return { success: false, message: 'Failed to add genre' };
  }
}

export async function migrateLocalStorageGenres() {
  try {
    const savedGenres = localStorage.getItem('customGenres');
    if (savedGenres) {
      const customGenres = JSON.parse(savedGenres);
      const currentGenres = await getGenres();
      
      // Add any missing genres from localStorage
      const newGenres = customGenres.filter(
        genre => !currentGenres.some(g => g.toLowerCase() === genre.toLowerCase())
      );
      
      if (newGenres.length > 0) {
        const updatedGenres = [...currentGenres, ...newGenres].sort();
        const docRef = doc(db, 'genres', GENRES_DOC_ID);
        await setDoc(docRef, { list: updatedGenres });
        
        // Clear localStorage after successful migration
        localStorage.removeItem('customGenres');
        
        return { success: true, migrated: newGenres.length, genres: updatedGenres };
      }
    }
    return { success: true, migrated: 0 };
  } catch (error) {
    console.error('Error migrating genres:', error);
    return { success: false, message: 'Failed to migrate genres' };
  }
}
