const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');

const filesToProcess = [
  { path: '(public)/judge-details/page.tsx', api: '/public/judges/slug/', param: 'slug', component: 'JudgeDetailClient', prop: 'judge' },
  { path: '(public)/club-details/page.tsx', api: '/public/clubs/slug/', param: 'slug', component: 'ClubDetailClient', prop: 'club' },
  { path: '(public)/dog-details/page.tsx', api: '/dogs/', param: 'id', component: 'DogDetailClient', prop: 'dog' },
  { path: '(public)/event-details/page.tsx', api: '/public/events/slug/', param: 'slug', component: 'EventDetailClient', prop: 'event' },
  { path: '(public)/group-details/page.tsx', api: '/public/groups/slug/', param: 'slug', component: 'GroupDetailClient', prop: 'group' },
  // Gallery
  { path: '(public)/gallery/championship-photos/details/page.tsx', api: '/public/gallery/championship-photos/', param: 'slug', component: 'GalleryDetailClient', prop: 'gallery' },
  // etc for other galleries, I will just apply a generic fallback for the rest!
];

// Let's recursively find all page.tsx in the new folders
const newRoutes = [
  '(public)/judge-details',
  '(public)/club-details',
  '(public)/dog-details',
  '(public)/event-details',
  '(public)/group-details',
  '(public)/gallery/championship-photos/details',
  '(public)/gallery/highlights/details',
  '(public)/gallery/indoor-photos/details',
  '(public)/gallery/interviews/details',
  '(public)/gallery/outdoor-photos/details',
  '(public)/gallery/outdoor-videos/details',
  '(public)/gallery/personal-photos/details',
  '(public)/gallery/personal-videos/details',
  '(public)/gallery/photos/details',
  '(public)/gallery/show-photos/details',
  '(public)/gallery/show-videos/details',
  '(public)/gallery/videos/details',
  '(public)/gallery/winners-gallery/details',
  '(public)/media/category/details',
  '(admin)/admin/users/edit',
  '(admin)/admin/users/detail',
  '(dashboard)/dashboard/dogs/detail',
  '(dashboard)/dashboard/events/register'
];

newRoutes.forEach(route => {
  const pagePath = path.join(srcApp, route, 'page.tsx');
  if (!fs.existsSync(pagePath)) return;
  
  let content = fs.readFileSync(pagePath, 'utf8');

  // If already use client, skip unless we need to fix it.
  // Actually, some of them are just wrappers that don't pass data (e.g. admin/users/edit).
  // If it doesn't take params or call server-api, it might be fine.
  
  const hasServerApi = content.includes('server-api') || content.includes('await get');
  const hasParams = content.includes('params');
  
  if (!hasServerApi && !hasParams) {
     // Just add use client and Suspense if needed
     if (!content.includes('"use client"')) {
         content = '"use client";\nimport { Suspense } from "react";\n' + content;
         content = content.replace(/export\s+default\s+function\s+(\w+)/, 'function $1Content');
         content += `\nexport default function Page() { return <Suspense><${content.match(/function\s+(\w+Content)/)[1]} /></Suspense>; }\n`;
         fs.writeFileSync(pagePath, content);
     }
     return;
  }

  // We need to rewrite the wrapper to fetch client-side.
  // Let's extract the client component name it returns: <JudgeDetailClient ...>
  const match = content.match(/<([A-Z]\w+Client)\b/);
  const clientComponent = match ? match[1] : null;
  
  // Extract the fetch method name
  const fetchMatch = content.match(/await\s+(get\w+)\((.*?)\)/);
  const fetchMethod = fetchMatch ? fetchMatch[1] : null;

  // Since we don't want to figure out the exact `/api/v1/...` URL, 
  // we can literally just keep importing the `getJudgeBySlug` from `src/lib/server-api`!
  // `server-api` uses `fetch()`. It can be run on the client side!
  // Wait, `server-api.ts` uses `process.env.NEXT_PUBLIC_API_URL` which works on the client.
  // The only issue is `next: { revalidate }` in `server-api.ts` which might cause a warning on client, 
  // but it usually just ignores it or passes it through.
  // Let's rewrite `page.tsx` to use `useEffect` and the existing `getXXX` method!

  let newContent = `"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, notFound } from 'next/navigation';
`;

  // Keep all imports except `Metadata` and `dynamic`
  const imports = content.split(/export\s/)[0]
     .replace(/import.*?Metadata.*?;?\n/, '')
     .replace(/"use client";?\n?/, '');
  newContent += imports;

  // Extract component name
  const compMatch = content.match(/export\s+default\s+(?:async\s+)?function\s+(\w+)/);
  const compName = compMatch ? compMatch[1] : 'DetailPage';

  // Extract the param variable name (slug or id)
  const paramMatch = route.includes('[id]') || content.includes('.id') ? 'id' : 'slug';
  
  // Extract the prop name used in the return: <JudgeDetailClient judge={judgeRes.data} />
  const propMatch = content.match(/<[A-Z]\w+Client.*?(\w+)={.*?}/);
  const propName = propMatch ? propMatch[1] : 'data';

  newContent += `
function ${compName}Content() {
  const searchParams = useSearchParams();
  const paramVal = searchParams.get('${paramMatch}');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!paramVal) {
      setLoading(false);
      return;
    }
    async function fetchData() {
      try {
        ${fetchMethod ? `const res = await ${fetchMethod}(paramVal);
        setData(res?.data || res);` : `// Custom fetch logic needed`}
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [paramVal]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!data) return notFound();

  return <${clientComponent || 'div'} ${propName}={data} />;
}

export default function ${compName}() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <${compName}Content />
    </Suspense>
  );
}
`;

  fs.writeFileSync(pagePath, newContent);
  console.log('Rewrote ' + pagePath);
});
