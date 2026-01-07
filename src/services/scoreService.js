import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const SCORES_COLLECTION = 'scores';

// Create a new score
export async function createScore(scoreData, userId) {
  try {
    const docRef = await addDoc(collection(db, SCORES_COLLECTION), {
      ...scoreData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...scoreData };
  } catch (error) {
    console.error('Error creating score:', error);
    throw error;
  }
}

// Get all scores for a user
export async function getUserScores(userId) {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() });
    });
    return scores;
  } catch (error) {
    console.error('Error fetching scores:', error);
    throw error;
  }
}

// Get a single score by ID
export async function getScore(scoreId) {
  try {
    const docRef = doc(db, SCORES_COLLECTION, scoreId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Score not found');
    }
  } catch (error) {
    console.error('Error fetching score:', error);
    throw error;
  }
}

// Update a score
export async function updateScore(scoreId, scoreData) {
  try {
    const docRef = doc(db, SCORES_COLLECTION, scoreId);
    await updateDoc(docRef, {
      ...scoreData,
      updatedAt: serverTimestamp(),
    });
    return { id: scoreId, ...scoreData };
  } catch (error) {
    console.error('Error updating score:', error);
    throw error;
  }
}

// Delete a score
export async function deleteScore(scoreId) {
  try {
    const docRef = doc(db, SCORES_COLLECTION, scoreId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting score:', error);
    throw error;
  }
}

// Search scores by title or composer
export async function searchScores(userId, searchTerm) {
  try {
    const q = query(
      collection(db, SCORES_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const scores = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const searchLower = searchTerm.toLowerCase();
      if (
        data.title?.toLowerCase().includes(searchLower) ||
        data.composer?.toLowerCase().includes(searchLower)
      ) {
        scores.push({ id: doc.id, ...data });
      }
    });
    return scores;
  } catch (error) {
    console.error('Error searching scores:', error);
    throw error;
  }
}
