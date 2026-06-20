import os
import re

src_dir = r"d:\bala backend\frontend\src\app"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    
    # We want to replace `}, details)` or `}, details]` but wait, it was literally `content.replace("[id]", "details")`
    # So `[id]` became `details`.
    # And `[slug]` became `details`.
    
    # We can just look for `}, details)` and change it based on whether we see `const slug =` or `const id =`.
    
    has_id = re.search(r'const\s+id\s*=', content)
    has_slug = re.search(r'const\s+slug\s*=', content)
    
    dep_var = 'id' if has_id else 'slug'
    
    # Fix `}, details)` to `}, [id])` or `}, [slug])`
    content = re.sub(r'\}\,\s*details\)', f'}}, [{dep_var}])', content)
    content = re.sub(r'\{\s*details\s*\}', f'{{ [{dep_var}] }}', content)
    
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed dependencies in {filepath}")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
