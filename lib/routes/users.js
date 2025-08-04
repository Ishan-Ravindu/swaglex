const express = require('express')
const router = express.Router()
const { getModels } = require('../core/database')
const Auth = require('../core/auth')

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const { User } = getModels()
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'permissions', 'createdAt', 'lastLogin']
    })
    res.json(user)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update current user profile
router.put('/profile', async (req, res) => {
  try {
    const { User } = getModels()
    const { email, password, currentPassword } = req.body

    const user = await User.findByPk(req.user.id)

    // If changing password, verify current password
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password required' })
      }

      const isValid = await Auth.verifyPassword(currentPassword, user.password)
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' })
      }

      user.password = await Auth.hashPassword(password)
    }

    if (email) {
      user.email = email
    }

    await user.save()

    // Update session
    req.session.user.email = user.email

    res.json({
      id: user.id,
      email: user.email,
      role: user.role
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

module.exports = router
