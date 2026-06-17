const fs = require('fs');
const path = require('path');

const srcApp = path.join(__dirname, 'src', 'app');

// Map of dynamic routes to static routes
const routesToMove = [
  { src: '(public)/judges/[slug]', dest: '(public)/judge-details' },
  { src: '(public)/clubs/[slug]', dest: '(public)/club-details' },
  { src: '(public)/dogs/[id]', dest: '(public)/dog-details' },
  { src: '(public)/events/[slug]', dest: '(public)/event-details' },
  { src: '(public)/groups/[slug]', dest: '(public)/group-details' },
  { src: '(public)/gallery/championship-photos/[slug]', dest: '(public)/gallery/championship-photos/details' },
  { src: '(public)/gallery/highlights/[slug]', dest: '(public)/gallery/highlights/details' },
  { src: '(public)/gallery/indoor-photos/[slug]', dest: '(public)/gallery/indoor-photos/details' },
  { src: '(public)/gallery/interviews/[slug]', dest: '(public)/gallery/interviews/details' },
  { src: '(public)/gallery/outdoor-photos/[slug]', dest: '(public)/gallery/outdoor-photos/details' },
  { src: '(public)/gallery/outdoor-videos/[slug]', dest: '(public)/gallery/outdoor-videos/details' },
  { src: '(public)/gallery/personal-photos/[slug]', dest: '(public)/gallery/personal-photos/details' },
  { src: '(public)/gallery/personal-videos/[slug]', dest: '(public)/gallery/personal-videos/details' },
  { src: '(public)/gallery/photos/[slug]', dest: '(public)/gallery/photos/details' },
  { src: '(public)/gallery/show-photos/[slug]', dest: '(public)/gallery/show-photos/details' },
  { src: '(public)/gallery/show-videos/[slug]', dest: '(public)/gallery/show-videos/details' },
  { src: '(public)/gallery/videos/[slug]', dest: '(public)/gallery/videos/details' },
  { src: '(public)/gallery/winners-gallery/[slug]', dest: '(public)/gallery/winners-gallery/details' },
  { src: '(public)/media/category/[slug]', dest: '(public)/media/category/details' },
  { src: '(admin)/admin/users/edit/[id]', dest: '(admin)/admin/users/edit' },
  { src: '(admin)/admin/users/[id]', dest: '(admin)/admin/users/detail' },
  { src: '(dashboard)/dashboard/dogs/[id]', dest: '(dashboard)/dashboard/dogs/detail' },
  { src: '(dashboard)/dashboard/events/[id]/register', dest: '(dashboard)/dashboard/events/register' }
];

function moveAndRefactor() {
  for (const route of routesToMove) {
    const srcPath = path.join(srcApp, route.src);
    const destPath = path.join(srcApp, route.dest);

    if (fs.existsSync(srcPath)) {
      console.log(`Moving ${route.src} to ${route.dest}`);
      
      // Ensure parent of dest exists
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      
      // If dest already exists (e.g. users/edit), move contents of [id] into it
      if (fs.existsSync(destPath)) {
        const files = fs.readdirSync(srcPath);
        for (const file of files) {
          fs.renameSync(path.join(srcPath, file), path.join(destPath, file));
        }
        fs.rmdirSync(srcPath);
      } else {
        fs.renameSync(srcPath, destPath);
      }

      // Now process page.tsx inside destPath
      const pageFile = path.join(destPath, 'page.tsx');
      if (fs.existsSync(pageFile)) {
        refactorPage(pageFile, route.src.includes('[slug]') ? 'slug' : 'id');
      }
    } else {
      console.log(`Source not found: ${srcPath}`);
    }
  }
}

function refactorPage(pagePath, paramName) {
  let content = fs.readFileSync(pagePath, 'utf8');

  // Step 1: Find the default export function
  const match = content.match(/export\s+default\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/);
  if (!match) return;

  const componentName = match[1];

  // We will replace the whole component block and metadata block.
  // Actually, let's just make the whole page a wrapper.
  // We need to keep imports.
  let imports = content.split(/export\s+/)[0];
  
  // Remove force-dynamic and server-api imports
  imports = imports.replace(/import.*?generateMetadata.*?\n/g, '');
  imports = imports.replace(/import.*?server-api.*?\n/g, '');
  imports = imports.replace(/export\s+const\s+dynamic.*?\n/g, '');
  
  // We don't know exactly what API to call. The original component used getJudgeBySlug etc.
  // But wait, the original component passed data to a ClientComponent like <JudgeDetailClient judge={judgeRes.data} />
  // If we just extract the return statement of the original component!
  const returnMatch = content.match(/return\s+(<[^>]+>|.*?;)/s);
  let originalReturn = returnMatch ? returnMatch[0] : 'return <div>No Return Found</div>;';

  // If the return statement uses judgeRes.data, we need to map it.
  // This is too complex for a blind regex replacement.
  // Let's take a simpler approach: 
  // We will rewrite the page.tsx to JUST read useSearchParams, and then import the actual original page content as a child component? No.
  
  // Alternative: Keep the original component, but remove `async`, `params`, and use hooks.
  let newContent = content;
  
  // 1. Add use client
  if (!newContent.includes('"use client"')) {
    newContent = '"use client";\nimport { Suspense, useEffect, useState } from "react";\nimport { useSearchParams } from "next/navigation";\nimport api from "@/services/api";\n' + newContent;
  }
  
  // 2. Remove generateMetadata
  newContent = newContent.replace(/export\s+(async\s+)?function\s+generateMetadata[\s\S]*?(?=export\s+default)/, '');
  newContent = newContent.replace(/export\s+const\s+dynamic.*?;\n?/, '');
  
  // 3. Replace component signature
  newContent = newContent.replace(
    /export\s+default\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{/,
    `function $1Content() {\n  const searchParams = useSearchParams();\n  const ${paramName} = searchParams.get('${paramName}');\n  const [data, setData] = useState<any>(null);\n  const [loading, setLoading] = useState(true);\n`
  );

  // We cannot automatically convert arbitrary await getXXX(slug) into api.get(`/api/v1/...`).
  // The user told us the API structure!
  // GET /api/v1/public/judges/slug/:slug
  // We can inject a generic fetcher if we know the entity.
}

moveAndRefactor();
