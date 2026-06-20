import os
import re

src_dir = r"d:\bala backend\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'generateStaticParams' not in content:
        return False
        
    print(f"Processing: {filepath}")
    
    # 1. Remove generateStaticParams function
    # Find start of function
    match = re.search(r'export\s+(async\s+)?function\s+generateStaticParams\s*\([^)]*\)\s*\{', content)
    if match:
        start_idx = match.start()
        # Find the matching closing brace
        brace_count = 0
        end_idx = -1
        in_string = False
        string_char = ''
        for i in range(start_idx, len(content)):
            char = content[i]
            # simplistic string handling
            if char in ("'", '"', '`'):
                if not in_string:
                    in_string = True
                    string_char = char
                elif string_char == char and content[i-1] != '\\':
                    in_string = False
            
            if not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    if brace_count == 0:
                        end_idx = i
                        break
        
        if end_idx != -1:
            # Also remove export const revalidate = ... if exists
            content = content[:start_idx] + content[end_idx+1:]
            
    # Remove export const revalidate = ...
    content = re.sub(r'export\s+const\s+revalidate\s*=\s*\d+;?\n?', '', content)
    
    # Insert export const dynamic = 'force-dynamic'; after the last import
    if "export const dynamic = 'force-dynamic';" not in content and "export const dynamic = \"force-dynamic\";" not in content:
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import_idx = i
        
        if last_import_idx != -1:
            lines.insert(last_import_idx + 1, "\nexport const dynamic = 'force-dynamic';")
            content = '\n'.join(lines)
        else:
            content = "export const dynamic = 'force-dynamic';\n" + content
            
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    return True

modified = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            if process_file(os.path.join(root, file)):
                modified += 1

print(f"Done. Modified {modified} files.")
