const TOKEN_KEY = 'campusLostFoundToken';
const USER_KEY = 'campusLostFoundUser';

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function saveAuthData(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getCurrentUser() {
  const userString = localStorage.getItem(USER_KEY);
  if (!userString) {
    return null;
  }

  try {
    return JSON.parse(userString);
  } catch (error) {
    return null;
  }
}

function apiFetch(path, options = {}) {
  const token = getStoredToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return fetch(`${window.APP_CONFIG.API_URL}${path}`, config)
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    });
}

function showMessage(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}

function logoutUser() {
  clearAuthData();
  window.location.href = 'login.html';
}

function updateAuthUI() {
  const user = getCurrentUser();
  const authLinks = document.querySelectorAll('[data-auth-link]');
  const userText = document.querySelector('[data-user-name]');

  authLinks.forEach((link) => {
    const authTarget = link.dataset.authLink;

    if (user) {
      if (authTarget === 'login') {
        link.style.display = 'none';
      }

      if (authTarget === 'register') {
        link.style.display = 'none';
      }

      if (authTarget === 'dashboard') {
        link.style.display = 'inline-block';
      }
    } else {
      if (authTarget === 'login') {
        link.style.display = 'inline-block';
      }

      if (authTarget === 'register') {
        link.style.display = 'inline-block';
      }

      if (authTarget === 'dashboard') {
        link.style.display = 'none';
      }
    }
  });

  if (userText) {
    userText.textContent = user ? `Hi, ${user.full_name}` : 'Guest';
  }

  const logoutButton = document.querySelector('[data-logout]');
  if (logoutButton) {
    logoutButton.style.display = user ? 'inline-flex' : 'none';
  }
}

function requireAuth() {
  const token = getStoredToken();
  if (!token) {
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

function requireAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  const logoutButton = document.querySelector('[data-logout]');
  if (logoutButton) {
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();
      logoutUser();
    });
  }
});
