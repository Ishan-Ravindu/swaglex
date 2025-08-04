const bcrypt = require('bcryptjs')
const { getModels } = require('./database')

class Auth {
  static async hashPassword (password) {
    return bcrypt.hash(password, 10)
  }

  static async verifyPassword (password, hash) {
    return bcrypt.compare(password, hash)
  }

  static async login (email, password) {
    const { User } = getModels()
    const user = await User.findOne({ where: { email } })
    if (!user) {
      throw new Error('Invalid credentials')
    }

    const isValid = await this.verifyPassword(password, user.password)
    if (!isValid) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  }

  static async createUser (userData) {
    const { User } = getModels()
    const { email, password, role = 'user', permissions = [] } = userData

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      throw new Error('User already exists')
    }

    const hashedPassword = await this.hashPassword(password)

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      permissions
    })

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    }
  }
}

module.exports = Auth
