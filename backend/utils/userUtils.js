import { getAuth } from 'firebase-admin/auth'
import User from '../models/User.js'
import Task from '../models/Task.js'
import { clearUserCache } from '../middleware/auth.js'
import { isPermanentAdmin, PERMANENT_ADMIN_EMAIL } from '../middleware/rbac.js'

/**
 * Robustly find, bind, or create a MongoDB user record from a Firebase auth token payload.
 * Handles cases where a user re-registers in Firebase Auth with the same email (new UID).
 */
export const findOrCreateOrBindUser = async (firebaseUser) => {
  if (!firebaseUser || !firebaseUser.uid) {
    throw new Error('Firebase user payload with UID is required')
  }

  let rawEmail = firebaseUser.email || ''

  // 1. If email is missing in the decoded ID token, attempt to fetch user from Firebase Admin SDK
  if (!rawEmail) {
    try {
      const fbUser = await getAuth().getUser(firebaseUser.uid)
      if (fbUser && fbUser.email) {
        rawEmail = fbUser.email
      }
    } catch (fbErr) {
      console.warn('Could not fetch Firebase Auth user details:', fbErr.message)
    }
  }

  const cleanEmail = rawEmail.trim().toLowerCase()
  const defaultEmail = cleanEmail || `${firebaseUser.uid}@kanbankc.internal`

  // 2. Try finding by exact Firebase UID
  let user = await User.findOne({ uid: firebaseUser.uid })

  if (user) {
    let modified = false
    // Auto-heal placeholder email or update if cleanEmail is available and different
    if (cleanEmail && (user.email.endsWith('@kanbankc.internal') || user.email !== cleanEmail)) {
      const existingWithEmail = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } })
      if (!existingWithEmail) {
        user.email = cleanEmail
        modified = true
      }
    }
    if (firebaseUser.role && user.role !== firebaseUser.role) {
      user.role = firebaseUser.role
      modified = true
    }
    if (isPermanentAdmin(cleanEmail) || isPermanentAdmin(user.email)) {
      if (user.role !== 'admin') {
        user.role = 'admin'
        modified = true
      }
    }
    if (modified) {
      await user.save()
    }
  }

  // 3. If not found by UID, try finding by clean email
  if (!user && cleanEmail) {
    user = await User.findOne({ email: cleanEmail })
    if (user) {
      // Re-bind the new Firebase UID to this user record
      user.uid = firebaseUser.uid
      if (firebaseUser.name && !user.name) {
        user.name = firebaseUser.name
      }
      if (isPermanentAdmin(cleanEmail)) {
        user.role = 'admin'
      }
      await user.save()
    }
  }

  // 4. If still not found, create a fresh User record
  if (!user) {
    user = await User.create({
      uid: firebaseUser.uid,
      email: defaultEmail,
      name: firebaseUser.name || (isPermanentAdmin(cleanEmail) ? 'Admin' : ''),
      role: isPermanentAdmin(cleanEmail) ? 'admin' : (firebaseUser.role || 'employee'),
      position: isPermanentAdmin(cleanEmail) ? 'Admin' : '',
    })
  }

  // Guarantee custom claims for the permanent admin
  if (isPermanentAdmin(cleanEmail) || isPermanentAdmin(user.email)) {
    try {
      await getAuth().setCustomUserClaims(firebaseUser.uid, { role: 'admin' })
    } catch (claimErr) {
      console.warn('Could not set custom claims for permanent admin:', claimErr.message)
    }
  }

  clearUserCache(user.uid)
  return user
}

/**
 * Permanently and smoothly purge a user from Firebase Auth, MongoDB User collection,
 * Task assignments, Superior hierarchies, and in-memory caches.
 */
export const purgeUserCompletely = async (user) => {
  if (!user) return
  if (isPermanentAdmin(user.email)) {
    throw new Error('Cannot purge the permanent admin account')
  }

  // 1. Delete from Firebase Auth
  if (user.uid) {
    try {
      await getAuth().deleteUser(user.uid)
    } catch (fbErr) {
      console.warn('Firebase user deletion warning (may already be deleted):', fbErr.message)
    }
  }

  // 2. Remove user from task assignees
  if (user._id) {
    try {
      await Task.updateMany({}, { $pull: { assignees: user._id } })
    } catch (tErr) {
      console.warn('Task cleanup warning on user deletion:', tErr.message)
    }

    // 3. Clear superior references for any subordinates
    try {
      await User.updateMany({ superior: user._id }, { superior: null })
    } catch (uErr) {
      console.warn('Subordinate cleanup warning on user deletion:', uErr.message)
    }
  }

  // 4. Delete user document(s) matching _id, uid, or email
  const cleanEmail = (user.email || '').trim().toLowerCase()
  const deleteConditions = []
  if (user._id) deleteConditions.push({ _id: user._id })
  if (user.uid) deleteConditions.push({ uid: user.uid })
  if (cleanEmail) deleteConditions.push({ email: cleanEmail })

  if (deleteConditions.length > 0) {
    await User.deleteMany({ $or: deleteConditions })
  }

  // 5. Clear user cache
  if (user.uid) {
    clearUserCache(user.uid)
  }
}

/**
 * Startup hook to ensure permanent admin exists, is synced, and has admin claims in Firebase & MongoDB.
 */
export const ensurePermanentAdmin = async () => {
  try {
    const cleanEmail = PERMANENT_ADMIN_EMAIL.toLowerCase()
    let dbUser = await User.findOne({ email: cleanEmail })

    let fbUser = null
    try {
      fbUser = await getAuth().getUserByEmail(cleanEmail)
    } catch (fbErr) {
      // Admin may not have registered in Firebase yet
    }

    if (fbUser) {
      try {
        await getAuth().setCustomUserClaims(fbUser.uid, { role: 'admin' })
      } catch (claimErr) {
        console.warn('Failed to set claims for permanent admin on startup:', claimErr.message)
      }

      if (!dbUser) {
        dbUser = await User.create({
          uid: fbUser.uid,
          email: cleanEmail,
          name: fbUser.displayName || 'Admin',
          role: 'admin',
          position: 'Admin',
        })
        console.log(`[Permanent Admin] Created MongoDB record for ${cleanEmail}`)
      } else {
        let modified = false
        if (dbUser.uid !== fbUser.uid) {
          dbUser.uid = fbUser.uid
          modified = true
        }
        if (dbUser.role !== 'admin') {
          dbUser.role = 'admin'
          modified = true
        }
        if (modified) {
          await dbUser.save()
          console.log(`[Permanent Admin] Synced MongoDB record for ${cleanEmail}`)
        }
      }
    } else if (dbUser && dbUser.role !== 'admin') {
      dbUser.role = 'admin'
      await dbUser.save()
      console.log(`[Permanent Admin] Updated role to admin for ${cleanEmail}`)
    }
  } catch (err) {
    console.warn('[Permanent Admin] Initialization check error:', err.message)
  }
}

