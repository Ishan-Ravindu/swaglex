const express = require('express')
const router = express.Router()
const fs = require('fs-extra')
const path = require('path')
const { getModels } = require('../core/database')

// Get all documents
router.get('/', async (req, res) => {
  try {
    const { Document } = getModels()
    const docsPath = req.app.locals.docsPath || './docs'
    const files = await fs.readdir(docsPath)
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'))

    // Get document metadata from database
    const documents = await Document.findAll()
    const docMap = new Map(documents.map(doc => [doc.filename, doc]))

    const docList = yamlFiles.map(file => {
      const doc = docMap.get(file)
      return {
        filename: file,
        name: file.replace(/\.(yaml|yml)$/, ''),
        description: doc?.description || '',
        isPublic: doc?.isPublic || false,
        hasAccess:
          req.user.role === 'admin' ||
          doc?.isPublic ||
          doc?.allowedRoles?.includes(req.user.role) ||
          doc?.allowedUsers?.includes(req.user.id) ||
          req.user.permissions?.includes(file.replace(/\.(yaml|yml)$/, ''))
      }
    })

    res.json(docList)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' })
  }
})

// Update document metadata
router.put('/:name', async (req, res) => {
  try {
    const { Document } = getModels()
    const { name } = req.params
    const { description, isPublic, allowedRoles, allowedUsers } = req.body

    let document = await Document.findOne({ where: { name } })

    if (!document) {
      document = await Document.create({
        name,
        filename: `${name}.yaml`,
        description,
        isPublic,
        allowedRoles,
        allowedUsers
      })
    } else {
      await document.update({
        description,
        isPublic,
        allowedRoles,
        allowedUsers
      })
    }

    res.json(document)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update document metadata' })
  }
})

module.exports = router
