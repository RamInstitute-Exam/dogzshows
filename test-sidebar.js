const navItems = [
    '/admin',
    '/admin/events',
    '/admin/clubs',
    '/admin/club-categories',
    '/admin/club-events',
    '/admin/club-committees',
    '/admin/club-galleries',
    '/admin/judges',
    '/admin/judges/bulk-upload',
    '/admin/users',
    '/admin/competition',
    '/admin/dogs',
    '/admin/fci-groups',
    '/admin/breeds',
    '/admin/age-classes',
    '/admin/media-gallery-mgmt?tab=list',
    '/admin/media-gallery-mgmt?tab=add',
    '/admin/media-gallery-mgmt?tab=images',
    '/admin/cms/featured-clubs',
    '/admin/cms/show-photos',
    '/admin/cms/outdoor-photos',
    '/admin/cms/sliding-sections',
    '/admin/cms/about',
    '/admin/settings'
];

async function testRoutes() {
    for (const route of navItems) {
        try {
            const res = await fetch(`http://localhost:3000${route}`);
            console.log(`${route} -> ${res.status}`);
        } catch (e) {
            console.log(`${route} -> Error: ${e.message}`);
        }
    }
}

testRoutes();
