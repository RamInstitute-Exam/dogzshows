import os
import re

src_dir = r"d:\Our Projects\DogProfileApp\frontend\src\app"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Fix duplicate React
    content = re.sub(r"import React, \{ Suspense, useEffect, useState \} from 'react';\nimport React from 'react';", "import React, { Suspense, useEffect, useState } from 'react';", content)
    
    # Fix imports for details
    content = content.replace("[slug]", "details")
    content = content.replace("[id]", "details") # wait, might break things? Let's be careful.
    
    # Actually, let's just do specific ones
    content = content.replace("../../show-photos/details/PhotoDetailClient", "../../show-photos/details/PhotoDetailClient") 
    content = content.replace("../../show-photos/[slug]/PhotoDetailClient", "../../show-photos/details/PhotoDetailClient") 
    content = content.replace("../../show-videos/[slug]/VideoDetailClient", "../../show-videos/details/VideoDetailClient") 
    
    # Fix string | null
    content = re.sub(r'await\s+(get\w+)\(paramVal\)', r'await \1(paramVal!)', content)
    
    # Fix missing props
    # Property 'data' does not exist on type 'DetailedHTMLProps...
    # This means the component was not found, it defaulted to 'div'.
    if 'event-details' in filepath:
        content = content.replace('<div event={data} />', '<EventDetailClient event={data} />')
    if 'media/category' in filepath:
        content = content.replace('<div data={data} />', '<MediaGalleryClient category={data} />')
    if 'gallery/photos/details' in filepath or 'gallery/show-photos/details' in filepath:
        content = content.replace('<PhotoDetailClient initialPhoto={data} />', '<PhotoDetailClient initialPhotos={[data]} />')
    if 'gallery/videos/details' in filepath or 'gallery/show-videos/details' in filepath:
        content = content.replace('<VideoDetailClient initialVideo={data} />', '<VideoDetailClient initialVideos={[data]} />')
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
