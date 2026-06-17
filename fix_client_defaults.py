import os

src_dir = r"d:\Our Projects\DogProfileApp\frontend\src\app\(public)\gallery"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # We made props optional, now we need to make sure we don't use them without checking or falling back
    # It's easier to just replace `initialPhotos.map` with `(initialPhotos || []).map` etc.
    # Or just replace `initialPhotos` with `(initialPhotos || [])` when it's followed by `.filter` or `.map`
    
    content = content.replace('initialPhotos.filter', '(initialPhotos || []).filter')
    content = content.replace('initialPhotos.map', '(initialPhotos || []).map')
    content = content.replace('initialPhotos.slice', '(initialPhotos || []).slice')
    content = content.replace('initialPhotos.length', '(initialPhotos || []).length')
    
    content = content.replace('initialVideos.filter', '(initialVideos || []).filter')
    content = content.replace('initialVideos.map', '(initialVideos || []).map')
    content = content.replace('initialVideos.slice', '(initialVideos || []).slice')
    content = content.replace('initialVideos.length', '(initialVideos || []).length')
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed defaults in {filepath}")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
