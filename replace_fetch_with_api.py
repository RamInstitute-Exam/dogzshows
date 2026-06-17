import os
import re

TARGET_DIR = r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'fetch(' not in content and 'fetch (' not in content:
        return

    original = content
    
    # Check if api is already imported
    if "import api" not in content and "import { api }" not in content:
        # Add import after the last import statement
        imports_end = [m.end() for m in re.finditer(r"^import .*;$", content, re.MULTILINE)]
        if imports_end:
            last_import = max(imports_end)
            content = content[:last_import] + "\nimport api from '@/services/api';" + content[last_import:]
        else:
            content = "import api from '@/services/api';\n" + content

    # Replace specific fetch patterns

    # Pattern 1:
    # const res = await fetch(`${config.apiUrl}/ROUTE`, { headers: ... });
    # const data = await res.json();
    # ->
    # const data = await api.get(`/ROUTE`);
    
    # We will do a generic replacement of fetch to api.get/api.post etc where possible.
    # Actually, it's safer to just replace `fetch(`${config.apiUrl}/users?page=${page}&limit=10&search=${search}`, { headers: ... })`
    
    # We will use simple strings for the known ones:
    
    content = re.sub(
        r"const res = await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*headers:\s*\{[^}]*\}\s*\}\);",
        r"const res = await api.get(`\1`);",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"const res = await fetch\(`\$\{config\.apiUrl\}(.*?)`\);",
        r"const res = await api.get(`\1`);",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'POST',\s*headers:\s*\{[^}]*\},\s*body:\s*(.*?)\s*\}\);",
        r"await api.post(`\1`, \2);",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'DELETE',\s*headers:\s*\{[^}]*\}\s*\}\);",
        r"await api.delete(`\1`);",
        content,
        flags=re.DOTALL
    )

    content = re.sub(
        r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'PUT',\s*headers:\s*\{[^}]*\},\s*body:\s*(.*?)\s*\}\);",
        r"await api.put(`\1`, \2);",
        content,
        flags=re.DOTALL
    )

    # Convert res.json() parsing since api.get already returns json
    # `const data = await res.json();`
    # If `res` was an api.get(), it is ALREADY the data.
    # So `const data = res;`
    content = re.sub(
        r"const\s+(\w+)\s*=\s*await\s+res\.json\(\);",
        r"const \1 = res;",
        content
    )

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for root, dirs, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))

print("Done refactoring fetch calls.")
