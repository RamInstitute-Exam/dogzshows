import os
import re

src_dir = r"d:\bala backend\frontend\src\app\(public)\gallery"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    content = content.replace('<PhotoDetailClient initialPhoto={data} />', '<PhotoDetailClient initialPhotos={[data]} />')
    content = content.replace('<VideoDetailClient initialVideo={data} />', '<VideoDetailClient initialVideos={[data]} />')
    
    # Check if there are other component names
    content = content.replace('initialPhoto={data}', 'initialPhotos={[data]}')
    content = content.replace('initialVideo={data}', 'initialVideos={[data]}')
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed props in {filepath}")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
