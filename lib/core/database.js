const { Sequelize, DataTypes } = require('sequelize')
const fs = require('fs-extra')
const path = require('path')

let sequelize = null
const models = {}

async function initDB (config) {
  // Ensure data directory exists
  await fs.ensureDir('./data')

  if (config.dialect === 'sqlite') {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: config.storage || './data/swagger-docs.db',
      logging: false
    })
  } else if (config.dialect === 'mysql' || config.dialect === 'mariadb') {
    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host || 'localhost',
      port: config.port || 3306,
      dialect: config.dialect,
      logging: false
    })
  } else if (config.dialect === 'postgres') {
    sequelize = new Sequelize(config.database, config.username, config.password, {
      host: config.host || 'localhost',
      port: config.port || 5432,
      dialect: 'postgres',
      logging: false
    })
  }

  try {
    await sequelize.authenticate()
    console.log('Database connection established successfully.')

    // Define models
    defineModels()

    // Sync database
    await sequelize.sync()

    // Create default admin if none exists
    const adminCount = await models.User.count({ where: { role: 'admin' } })

    if (adminCount === 0) {
      const Auth = require('./auth')
      await Auth.createUser({
        email: 'admin@swagger-docs.local',
        password: 'admin123',
        role: 'admin'
      })
      console.log('Default admin created: admin@swagger-docs.local / admin123')
      console.log('Please change the password after first login!')
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    throw error
  }
}

function defineModels () {
  // Define User model
  models.User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user'
      },
      permissions: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ['email']
        }
      ]
    }
  )

  // Define Document model
  models.Document = sequelize.define(
    'Document',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      allowedRoles: {
        type: DataTypes.JSON,
        defaultValue: ['admin', 'user']
      },
      allowedUsers: {
        type: DataTypes.JSON,
        defaultValue: []
      }
    },
    {
      timestamps: true
    }
  )
}

function getDB () {
  if (!sequelize) {
    throw new Error('Database not initialized. Call initDB first.')
  }
  return sequelize
}

function getModels () {
  if (!sequelize) {
    throw new Error('Database not initialized. Call initDB first.')
  }
  return models
}

module.exports = { initDB, getDB, getModels }
