import type { Auth, User, GoogleAuthProvider } from 'firebase/auth'
import type { Messaging } from 'firebase/messaging'

// Lightweight identity used by existing screens to populate the demo API.
// No Firebase app is initialized and no credentials or account services load.
const demoUser = {
  uid: 'demo-admin-uid',
  email: 'avery.stone@example.com',
  displayName: 'Avery Stone',
  getIdToken: async () => 'demo-token',
} as User

export const auth = {
  currentUser: demoUser,
  onAuthStateChanged: (listener: (user: User | null) => void) => {
    queueMicrotask(() => listener(demoUser))
    return () => undefined
  },
  signOut: async () => undefined,
} as unknown as Auth

export const googleProvider = {} as GoogleAuthProvider
export const messaging = {} as Messaging
