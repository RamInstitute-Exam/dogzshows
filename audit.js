const fs = require('fs');
const path = require('path');

const ADMIN_PATH = path.join(__dirname, 'src', 'app', 'admin');

const requiredModules = [
  'events',
  'competitions', // Shows
  'judges',
  'clubs',
  'dogs',
  'breeds',
  'media-gallery/albums',
  'media-gallery/photos',
  'users',
  'rbac', // Roles & Permissions
  'settings',
  'notifications',
  'reports',
  'entries', // Registrations
  'competition/winners', // Winners
  'club-categories', // Categories
  'banners',
  'cms',
];

const subRoutes = ['', 'create', 'edit'];

const results = [];

requiredModules.forEach(mod => {
  subRoutes.forEach(sub => {
    const routePath = sub ? path.join(ADMIN_PATH, mod, sub) : path.join(ADMIN_PATH, mod);
    const pagePath = path.join(routePath, 'page.tsx');
    const exists = fs.existsSync(pagePath);
    
    // For 'edit', we also check [id]
    let editIdExists = false;
    if (sub === 'edit') {
      editIdExists = fs.existsSync(path.join(routePath, '[id]', 'page.tsx'));
      if (!editIdExists) {
          editIdExists = fs.existsSync(path.join(ADMIN_PATH, mod, '[id]', 'edit', 'page.tsx'));
      }
    }

    if (!exists && !(sub === 'edit' && editIdExists)) {
      results.push(`Missing: /admin/${mod}${sub ? '/' + sub : ''}`);
    } else {
        if (sub === 'edit' && editIdExists) {
            // Found edit with id
        } else {
            // Normal page exists
        }
    }
  });
});

console.log('--- AUDIT RESULTS ---');
results.forEach(r => console.log(r));

