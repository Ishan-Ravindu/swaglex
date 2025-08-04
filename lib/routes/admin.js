const express = require('express')
const router = express.Router()
const { getModels } = require('../core/database')
const Auth = require('../core/auth')

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { User } = getModels()
    const users = await User.findAll({
      attributes: ['id', 'email', 'role', 'permissions', 'lastLogin', 'createdAt']
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// Create user
router.post('/users', async (req, res) => {
  try {
    const { email, password, role, permissions } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const user = await Auth.createUser({
      email,
      password,
      role,
      permissions
    })

    res.json(user)
  } catch (error) {
    if (error.message === 'User already exists') {
      return res.status(409).json({ error: error.message })
    }
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { User } = getModels()
    const { id } = req.params
    const { email, password, role, permissions } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updates = { email, role, permissions }

    if (password) {
      updates.password = await Auth.hashPassword(password)
    }

    await user.update(updates)

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const { User } = getModels()
    const { id } = req.params

    // Prevent deleting the last admin
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role === 'admin') {
      const adminCount = await User.count({ where: { role: 'admin' } })
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last admin' })
      }
    }

    await user.destroy()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

module.exports = router
