import os
import re

def fix_clubs_bulk_upload():
    filepath = r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\clubs\bulk-upload\page.tsx"
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace("import { toast } from 'react-hot-toast';", "import { toast } from 'sonner';")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def revert_external_fetches():
    files = [
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\judges\create\page.tsx",
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\judges\edit\page.tsx"
    ]
    for filepath in files:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            # If accidentally replaced to api.get
            content = re.sub(
                r"const (.*?) = await api\.get\(`https://api\.postalpincode\.in(.*?)\);",
                r"const \1 = await fetch(`https://api.postalpincode.in\2);\n        const data = await \1.json();",
                content
            )
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

def fix_remaining_fetches():
    files = [
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\cms\homepage-banners\page.tsx",
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\cms\menus\page.tsx",
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\cms\page-banners\page.tsx",
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\users\permissions\page.tsx",
        r"d:\Our Projects\DogProfileApp\frontend\src\app\(admin)\admin\users\roles\page.tsx"
    ]
    for filepath in files:
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            content = re.sub(
                r"const res = await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*(?:method|headers)[\s\S]*?\}\);",
                r"const res = await api.get(`\1`);",
                content
            )
            content = re.sub(
                r"const res = await fetch\(`\$\{config\.apiUrl\}(.*?)`\);",
                r"const res = await api.get(`\1`);",
                content
            )
            content = re.sub(
                r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'DELETE'[\s\S]*?\}\);",
                r"await api.delete(`\1`);",
                content
            )
            content = re.sub(
                r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'POST',[\s\S]*?body:\s*(.*?)\s*\}\);",
                r"await api.post(`\1`, \2);",
                content
            )
            content = re.sub(
                r"await fetch\(`\$\{config\.apiUrl\}(.*?)`,\s*\{\s*method:\s*'PUT',[\s\S]*?body:\s*(.*?)\s*\}\);",
                r"await api.put(`\1`, \2);",
                content
            )
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

fix_clubs_bulk_upload()
revert_external_fetches()
fix_remaining_fetches()
print("Fixed remaining syntax issues.")
