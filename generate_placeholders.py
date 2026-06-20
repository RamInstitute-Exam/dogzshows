import os

routes = [
    '/admin/analytics',
    '/admin/activity',
    '/admin/users',
    '/admin/users/create',
    '/admin/users/roles',
    '/admin/users/permissions',
    '/admin/judges',
    '/admin/judges/create',
    '/admin/judges/bulk-upload',
    '/admin/judges/categories',
    '/admin/judges/requests',
    '/admin/clubs',
    '/admin/clubs/create',
    '/admin/clubs/bulk-upload',
    '/admin/events',
    '/admin/events/create',
    '/admin/events/calendar',
    '/admin/events/upcoming',
    '/admin/events/completed',
    '/admin/competition/results',
    '/admin/entries/pending',
    '/admin/entries/approved',
    '/admin/entries/rejected',
    '/admin/media/photos',
    '/admin/media/photos/create',
    '/admin/media/photos/categories',
    '/admin/media/photos/albums',
    '/admin/media/photos/featured',
    '/admin/media/videos',
    '/admin/media/videos/create',
    '/admin/media/videos/categories',
    '/admin/media/videos/featured',
    '/admin/cms/homepage-banners',
    '/admin/cms/featured',
    '/admin/cms/seo',
    '/admin/cms/footer',
    '/admin/cms/testimonials',
    '/admin/cms/faqs',
    '/admin/settings/general',
    '/admin/settings/email',
    '/admin/settings/aws',
    '/admin/settings/logo',
    '/admin/settings/seo',
    '/admin/settings/social',
    '/admin/settings/theme',
    '/admin/notifications/push',
    '/admin/notifications/email',
    '/admin/notifications/sms',
    '/admin/reports/revenue',
    '/admin/reports/users',
    '/admin/reports/shows',
    '/admin/reports/entries',
    '/admin/reports/media',
    '/admin/reports/downloads',
    '/admin/payments/transactions',
    '/admin/payments/refunds',
    '/admin/payments/payouts',
    '/admin/payments/invoices',
    '/admin/audit-logs'
]

base_dir = r"d:\bala backend\frontend\src\app\(admin)"

template = """import React from 'react';
import UnderConstruction from '@/components/admin/UnderConstruction';

export default function Page() {
  return <UnderConstruction moduleName="{module_name}" />;
}
"""

created_count = 0

for route in routes:
    # route is like "/admin/settings/general"
    # remove leading slash to join correctly
    route_path = route.strip('/')
    
    dir_path = os.path.join(base_dir, route_path.replace('/', os.sep))
    file_path = os.path.join(dir_path, 'page.tsx')
    
    if not os.path.exists(file_path):
        os.makedirs(dir_path, exist_ok=True)
        # Format module name nicely
        module_name = route.split('/')[-1].replace('-', ' ').title()
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(template.replace('{module_name}', module_name))
        
        print(f"Created placeholder for: {route}")
        created_count += 1
    else:
        print(f"Exists: {route}")

print(f"Total placeholders created: {created_count}")
