import express from 'express'
import { getAuth } from 'firebase-admin/auth'
import User from '../models/User.js'
import SystemConfig from '../models/SystemConfig.js'
import { roles, requireAdmin, requireEmployee, isPermanentAdmin } from '../middleware/rbac.js'
import { clearUserCache } from '../middleware/auth.js'
import { sendNotificationToUsers } from '../utils/messaging.js'
import { purgeUserCompletely } from '../utils/userUtils.js'

const getAllSubordinateIds = async (userId) => {
  const directSubs = await User.find({ superior: userId }).select('_id').lean()
  let allIds = directSubs.map(sub => sub._id.toString())
  for (const sub of directSubs) {
    const childIds = await getAllSubordinateIds(sub._id)
    allIds = allIds.concat(childIds)
  }
  return [...new Set(allIds)]
}

const router = express.Router()

router.get('/', requireEmployee, async (req, res) => {
  try {
    let users = await User.find({})
      .select('email contactEmail name role department username superior isWarned uid position')
      .populate('superior', 'name email contactEmail username')
      .lean()

    // Keep the admin list in sync with the email stored in Firebase Auth.
    const healingPromises = users.map(async (u) => {
      if (u.uid) {
        try {
          const fbUser = await getAuth().getUser(u.uid)
          const cleanEmail = fbUser.email?.trim().toLowerCase()
          if (cleanEmail && cleanEmail !== u.email) {
            const existingWithEmail = await User.findOne({
              email: cleanEmail,
              _id: { $ne: u._id },
            })
            if (existingWithEmail) {
              console.error(
                `Firebase email sync conflict for user ${u.uid}: the email is already assigned to another user`,
              )
            } else {
              await User.updateOne({ _id: u._id }, { email: cleanEmail })
              clearUserCache(u.uid)
            }
            u.email = cleanEmail
          }
        } catch (fbErr) {
          console.warn(`Could not sync Firebase email for user ${u.uid}:`, fbErr.message)
        }
      }
      return u
    })

    users = await Promise.all(healingPromises)
    users = users.map((u) => {
      if (isPermanentAdmin(u.email) && u.role !== 'admin') {
        u.role = 'admin'
        User.updateOne({ _id: u._id }, { role: 'admin' }).catch(() => {})
      }
      return u
    })
    res.json(users)
  } catch (error) {
    console.error('List users failed:', error)
    res.status(500).json({ error: 'Unable to list users' })
  }
})

router.post('/', requireAdmin, async (req, res) => {
  const { email, password, name, role = roles.EMPLOYEE, department = '' } = req.body
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' })
  }

  try {
    const firebaseUser = await getAuth().createUser({
      email,
      password,
      displayName: name,
    })

    await getAuth().setCustomUserClaims(firebaseUser.uid, { role })

    const userRecord = await User.create({
      uid: firebaseUser.uid,
      email,
      name,
      role,
      department,
    })

    res.status(201).json({
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role,
      department: userRecord.department,
    })
  } catch (error) {
    console.error('Provision user failed:', error)
    res.status(500).json({ error: 'Unable to provision user' })
  }
})

router.patch('/:id/role', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { role } = req.body
  if (!Object.values(roles).includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (isPermanentAdmin(user.email)) {
      return res.status(400).json({ error: 'Cannot change the role of the permanent admin' })
    }

    await getAuth().setCustomUserClaims(user.uid, { role })
    user.role = role
    await user.save()
    clearUserCache(user.uid)

    res.json({
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    })
  } catch (error) {
    console.error('Change role failed:', error)
    res.status(500).json({ error: 'Unable to change role' })
  }
})

router.patch('/:id/warn', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { isWarned } = req.body

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (isPermanentAdmin(user.email)) {
      return res.status(400).json({ error: 'Cannot warn the permanent admin' })
    }

    user.isWarned = typeof isWarned === 'boolean' ? isWarned : !user.isWarned
    await user.save()
    clearUserCache(user.uid)

    if (user.isWarned) {
      sendNotificationToUsers(
        [user._id],
        'Warning Issued',
        "Warning: You're Under Watch",
        { type: 'warning' }
      )
    }

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      isWarned: user.isWarned,
    })
  } catch (error) {
    console.error('Warn user failed:', error)
    res.status(500).json({ error: 'Unable to update warning status' })
  }
})

router.patch('/:id/superior', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { superiorId } = req.body

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (superiorId) {
      if (superiorId === id) {
        return res.status(400).json({ error: 'User cannot be their own superior' })
      }
      const superior = await User.findById(superiorId)
      if (!superior) {
        return res.status(404).json({ error: 'Superior user not found' })
      }
      user.superior = superior._id
    } else {
      user.superior = null
    }

    await user.save()
    clearUserCache(user.uid)

    const updatedUser = await User.findById(id).populate('superior', 'name email username').lean()
    res.json(updatedUser)
  } catch (error) {
    console.error('Update superior failed:', error)
    res.status(500).json({ error: 'Unable to update superior' })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (isPermanentAdmin(user.email)) {
      return res.status(400).json({ error: 'Cannot delete the permanent admin account' })
    }

    await purgeUserCompletely(user)

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user failed:', error)
    res.status(500).json({ error: 'Unable to delete user' })
  }
})

router.patch('/:id/email', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { email } = req.body

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required' })
  }

  const cleanEmail = email.trim().toLowerCase()

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (isPermanentAdmin(user.email)) {
      return res.status(400).json({ error: 'Cannot change the email of the permanent admin' })
    }

    const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } })
    if (existing) {
      return res.status(400).json({ error: 'Email address is already in use by another user' })
    }

    if (user.uid) {
      try {
        await getAuth().updateUser(user.uid, { email: cleanEmail })
      } catch (fbErr) {
        console.warn('Could not update email in Firebase Auth:', fbErr.message)
      }
    }

    user.email = cleanEmail
    await user.save()
    clearUserCache(user.uid)

    res.json({
      _id: user._id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error('Update email failed:', error)
    res.status(500).json({ error: 'Unable to update user email' })
  }
})

router.patch('/:id/position', requireAdmin, async (req, res) => {
  const { id } = req.params
  const { position } = req.body

  if (typeof position !== 'string') {
    return res.status(400).json({ error: 'Position must be a string' })
  }

  try {
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    user.position = position.trim()
    await user.save()
    clearUserCache(user.uid)

    res.json({
      _id: user._id,
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      position: user.position,
    })
  } catch (error) {
    console.error('Update position failed:', error)
    res.status(500).json({ error: 'Unable to update position' })
  }
})

const DEFAULT_POSITIONS = ['Intern', 'Superior Intern', 'Leader', 'Admin', 'CTO', 'COO', 'CEO']

router.get('/position-options', requireEmployee, async (req, res) => {
  try {
    const config = await SystemConfig.findOne({ key: 'positionOptions' }).lean()
    const options = config ? config.value : DEFAULT_POSITIONS
    res.json(options)
  } catch (error) {
    console.error('Fetch position options failed:', error)
    res.status(500).json({ error: 'Unable to fetch position options' })
  }
})

router.post('/position-options', requireAdmin, async (req, res) => {
  const { position } = req.body

  if (!position || typeof position !== 'string' || !position.trim()) {
    return res.status(400).json({ error: 'A valid position name is required' })
  }

  const trimmed = position.trim()

  try {
    let config = await SystemConfig.findOne({ key: 'positionOptions' })
    if (!config) {
      config = await SystemConfig.create({ key: 'positionOptions', value: [...DEFAULT_POSITIONS] })
    }

    const existing = Array.isArray(config.value) ? config.value : []
    if (existing.map(v => v.toLowerCase()).includes(trimmed.toLowerCase())) {
      return res.status(400).json({ error: 'This position already exists' })
    }

    existing.push(trimmed)
    config.value = existing
    config.markModified('value')
    await config.save()

    res.json(existing)
  } catch (error) {
    console.error('Add position option failed:', error)
    res.status(500).json({ error: 'Unable to add position option' })
  }
})

export default router
