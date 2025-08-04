let users = []

async function loadUsers () {
  try {
    const response = await fetch('/api/admin/users')
    users = await response.json()
    renderUsersTable()
  } catch (error) {
    console.error('Failed to load users:', error)
    alert('Failed to load users')
  }
}

function renderUsersTable () {
  const tbody = document.querySelector('#usersTable tbody')
  tbody.innerHTML = ''

  users.forEach(user => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${user.permissions.join(', ') || 'All'}</td>
            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="editUser('${user.id}')">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `
    tbody.appendChild(tr)
  })
}

function showModal () {
  document.getElementById('userModal').style.display = 'block'
}

function closeModal () {
  document.getElementById('userModal').style.display = 'none'
  document.getElementById('userForm').reset()
  document.getElementById('userId').value = ''
}

document.getElementById('addUserBtn').addEventListener('click', () => {
  document.getElementById('modalTitle').textContent = 'Add User'
  showModal()
})

document.getElementById('userForm').addEventListener('submit', async e => {
  e.preventDefault()

  const userId = document.getElementById('userId').value
  const userData = {
    email: document.getElementById('userEmail').value,
    password: document.getElementById('userPassword').value,
    role: document.getElementById('userRole').value,
    permissions: document
      .getElementById('userPermissions')
      .value.split(',')
      .map(p => p.trim())
      .filter(p => p)
  }

  try {
    const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users'
    const method = userId ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      throw new Error('Failed to save user')
    }

    closeModal()
    loadUsers()
  } catch (error) {
    alert(`Failed to save user: ${error.message}`)
  }
})

async function editUser (userId) {
  const user = users.find(u => u.id === userId)
  if (!user) return

  document.getElementById('modalTitle').textContent = 'Edit User'
  document.getElementById('userId').value = user.id
  document.getElementById('userEmail').value = user.email
  document.getElementById('userRole').value = user.role
  document.getElementById('userPermissions').value = user.permissions.join(', ')

  showModal()
}

async function deleteUser (userId) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return
  }

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }

    loadUsers()
  } catch (error) {
    alert(`Failed to delete user: ${error.message}`)
  }
}

// Load users on page load
loadUsers()
