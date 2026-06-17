import os
import re

src_dir = r"d:\Our Projects\DogProfileApp\frontend\src\app\(public)\gallery"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # Make them optional
    content = content.replace('initialPhoto: any;', 'initialPhoto?: any;')
    content = content.replace('initialPhotos: any[];', 'initialPhotos?: any[];')
    content = content.replace('initialVideo: any;', 'initialVideo?: any;')
    content = content.replace('initialVideos: any[];', 'initialVideos?: any[];')
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed optional props in {filepath}")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
