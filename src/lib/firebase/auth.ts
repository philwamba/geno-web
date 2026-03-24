import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    User as FirebaseUser,
    AuthError,
} from 'firebase/auth'
import { auth } from './config'
import { api, authApi } from '../api/client'

export type AuthUser = FirebaseUser

// Map Firebase error codes to user-friendly messages
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests':
        'Too many failed attempts. Please try again later.',
    'auth/network-request-failed':
        'Network error. Please check your connection.',
    'auth/popup-closed-by-user': 'Sign in was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/invalid-api-key': 'Configuration error. Please contact support.',
}

export function getFirebaseErrorMessage(error: AuthError): string {
    return (
        FIREBASE_ERROR_MESSAGES[error.code] ||
        error.message ||
        'An error occurred. Please try again.'
    )
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
    )
    return userCredential.user
}

// Create account with email and password
export async function createAccountWithEmail(
    email: string,
    password: string,
    displayName: string,
) {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
    )
    await updateProfile(userCredential.user, { displayName })
    return userCredential.user
}

// Sign in with Google
export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider()
    const userCredential = await signInWithPopup(auth, provider)
    return userCredential.user
}

// Sign out
export async function firebaseSignOut() {
    await signOut(auth)
}

// Send password reset email
export async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email)
}

// Authenticate with backend after Firebase auth
export async function authenticateWithBackend(firebaseUser: FirebaseUser) {
    // Get the Firebase ID token to send to backend for verification
    const idToken = await firebaseUser.getIdToken()

    const response = await authApi.firebaseAuth({
        token: idToken,
        firebase_uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || undefined,
        photo_url: firebaseUser.photoURL || undefined,
        phone_number: firebaseUser.phoneNumber || undefined,
    })

    // Store the token
    api.setToken(response.token)

    return response
}

// Subscribe to auth state changes
export function subscribeToAuthState(
    callback: (user: FirebaseUser | null) => void,
) {
    return onAuthStateChanged(auth, callback)
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
}

// Get ID token
export async function getIdToken(): Promise<string | null> {
    const user = auth.currentUser
    if (!user) return null
    return user.getIdToken()
}
