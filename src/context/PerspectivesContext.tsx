import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';

export interface PerspectiveRecord {
  id: string;
  authorUid: string;
  authorName: string;
  authorRole: string;
  photoUrl: string;
  message: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface SubmitPerspectiveInput {
  authorName: string;
  authorRole: string;
  photoUrl: string;
  message: string;
}

interface PerspectivesContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string;
  perspectives: PerspectiveRecord[];
  perspectivesLoading: boolean;
  perspectivesError: string;
  signInWithGoogle: () => Promise<void>;
  logOut: () => Promise<void>;
  submitPerspective: (input: SubmitPerspectiveInput) => Promise<void>;
  deletePerspective: (id: string) => Promise<void>;
}

const PerspectivesContext = createContext<PerspectivesContextValue | null>(null);

const PHOTO_PATTERN = /^(https:\/\/|data:image\/(jpeg|jpg|png|webp);base64,).+$/;

export function PerspectivesProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');

  const [perspectives, setPerspectives] = useState<PerspectiveRecord[]>([]);
  const [perspectivesLoading, setPerspectivesLoading] = useState(true);
  const [perspectivesError, setPerspectivesError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;

    const perspectivesRef = collection(db, 'perspectives');
    const q = query(perspectivesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: PerspectiveRecord[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorUid: String(data.authorUid ?? ''),
            authorName: String(data.authorName ?? ''),
            authorRole: String(data.authorRole ?? ''),
            photoUrl: String(data.photoUrl ?? ''),
            message: String(data.message ?? ''),
            createdAt: (data.createdAt as Timestamp | null) ?? null,
            updatedAt: (data.updatedAt as Timestamp | null) ?? null,
          };
        });
        setPerspectives(items);
        setPerspectivesLoading(false);
        setPerspectivesError('');
      },
      (err) => {
        setPerspectivesLoading(false);
        setPerspectivesError('Unable to load perspectives right now.');
        try {
          handleFirestoreError(err, OperationType.LIST, 'perspectives');
        } catch {
          // Logged cleanly via handleFirestoreError
        }
      }
    );

    return () => unsubscribe();
  }, [authReady]);

  const signInWithGoogle = async () => {
    setAuthError('');
    setAuthBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Sign-in popup was closed before completing.');
      } else if (msg.includes('popup-blocked')) {
        setAuthError('Browser blocked the sign-in popup. Please allow popups for this site and try again.');
      } else {
        setAuthError(msg);
      }
    } finally {
      setAuthBusy(false);
    }
  };

  const logOut = async () => {
    setAuthError('');
    await signOut(auth);
  };

  const submitPerspective = async (input: SubmitPerspectiveInput) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Please sign in with your Google account before submitting.');
    }

    const authorName = input.authorName.trim().slice(0, 80);
    const authorRole = input.authorRole.trim().slice(0, 100);
    const photoUrl = input.photoUrl.trim();
    const message = input.message.trim().slice(0, 1200);

    if (!authorName) {
      throw new Error('Please enter your display name.');
    }
    if (!photoUrl || !PHOTO_PATTERN.test(photoUrl) || photoUrl.length > 150000) {
      throw new Error('A picture is compulsory. Please upload or attach your photo first.');
    }
    if (message.length < 5) {
      throw new Error('Please write at least 5 characters for your perspective or message.');
    }

    try {
      await addDoc(collection(db, 'perspectives'), {
        authorUid: currentUser.uid,
        authorName,
        authorRole,
        photoUrl,
        message,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'perspectives');
    }
  };

  const deletePerspective = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'perspectives', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `perspectives/${id}`);
    }
  };

  return (
    <PerspectivesContext.Provider
      value={{
        user,
        authReady,
        authBusy,
        authError,
        perspectives,
        perspectivesLoading,
        perspectivesError,
        signInWithGoogle,
        logOut,
        submitPerspective,
        deletePerspective,
      }}
    >
      {children}
    </PerspectivesContext.Provider>
  );
}

export function usePerspectives() {
  const ctx = useContext(PerspectivesContext);
  if (!ctx) {
    throw new Error('usePerspectives must be used within a PerspectivesProvider');
  }
  return ctx;
}
