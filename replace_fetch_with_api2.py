import os
import re

TARGET_DIR = r"d:\bala backend\frontend\src\app\(admin)\admin"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Check if api is already imported
    if "import api" not in content and "import { api }" not in content:
        imports_end = [m.end() for m in re.finditer(r"^import .*;$", content, re.MULTILINE)]
        if imports_end:
            last_import = max(imports_end)
            content = content[:last_import] + "\nimport api from '@/services/api';" + content[last_import:]
        else:
            content = "import api from '@/services/api';\n" + content

    # Replace fetch with headers
    content = re.sub(
        r"const res = await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*(?:headers|method)[\s\S]*?\}\);",
        r"const res = await api.get(`\1`);",
        content
    )
    
    # Replace fetch with DELETE
    content = re.sub(
        r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'DELETE'[\s\S]*?\}\);",
        r"await api.delete(`\1`);",
        content
    )
    
    # Replace fetch POST
    content = re.sub(
        r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'POST',[\s\S]*?body:\s*(.*?)\s*\}\);",
        r"await api.post(`\1`, \2);",
        content
    )

    # Replace fetch PUT
    content = re.sub(
        r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'PUT',[\s\S]*?body:\s*(.*?)\s*\}\);",
        r"await api.put(`\1`, \2);",
        content
    )

    # Replace remaining simple fetches
    content = re.sub(
        r"const res = await fetch\(`\$\{config\.apiUrl\}(.*?)`\);",
        r"const res = await api.get(`\1`);",
        content
    )

    # Fix the res.json() mistake from previous script if there's any
    # If the file still has const data = res; but it was NOT converted to api.get, this is why it broke.
    # Actually, the above generic re.sub should fix the left-over fetch calls to api.get().

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done refactoring fetch calls round 2.")
