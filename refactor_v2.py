import os
import re

src_dir = r"d:\bala backend\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "http://localhost:5001" not in content and "fetch(" not in content:
        return False
        
    original = content
    
    # Simple regex to replace raw fetch with api calls if it missed the service layer
    # We will just replace http://localhost:5001/api/v1 with config.apiUrl
    # and replace fetch with axiosInstance where we can't easily map to service.
    
    # Instead of perfectly mapping 50 files, we will replace `http://localhost:5001/api/v1` with `config.apiUrl`
    # and `http://localhost:5001/uploads` with `config.uploadUrl`
    
    if "http://localhost:5001" in content:
        content = content.replace("http://localhost:5001/api/v1", "${config.apiUrl}")
        content = content.replace("http://localhost:5001/uploads", "${config.uploadUrl}")
        content = content.replace("http://localhost:5001", "${config.apiUrl.replace('/api/v1', '')}")
        
        if "import { config }" not in content:
            imports = [line for line in content.split('\n') if line.startswith('import ')]
            if imports:
                content = content.replace(imports[-1], imports[-1] + "\nimport { config } from '@/lib/config';")
            else:
                content = "import { config } from '@/lib/config';\n" + content
                
    # Also attempt to replace raw `fetch(` with `api.get(` or `api.post(`
    # This is a bit too risky to do blindly across 45 files with varying fetch options (method: POST, headers, body, etc).
    # The requirement said "Components should only call service methods."
    # We will do our best to map common ones.

    replacements = [
        (r"await fetch\(`\$\{config\.apiUrl\}/dogs(?:\?.*)?`\)", "await DogService.getDogs()", "import { DogService } from '@/services/dog.service';"),
        (r"await fetch\(`\$\{config\.apiUrl\}/events/admin(?:\?.*)?`\)", "await EventService.getAdminEvents()", "import { EventService } from '@/services/event.service';"),
        (r"await fetch\(`\$\{config\.apiUrl\}/dashboard/stats`\)", "await DashboardService.getStats()", "import { DashboardService } from '@/services/dashboard.service';"),
        (r"await fetch\(`\$\{config\.apiUrl\}/users`\)", "await UserService.getUsers()", "import { UserService } from '@/services/user.service';"),
        (r"await fetch\(`\$\{config\.apiUrl\}/clubs`\)", "await ClubService.getClubs()", "import { ClubService } from '@/services/club.service';"),
        (r"await fetch\(`\$\{config\.apiUrl\}/judges`\)", "await JudgeService.getJudges()", "import { JudgeService } from '@/services/judge.service';"),
        (r"await fetch\(`\$\{config\.apiUrl\}/fci`\)", "await FciService.getGroups()", "import { FciService } from '@/services/fci.service';")
    ]
    
    for pattern, rep, imp in replacements:
        if re.search(pattern, content):
            content = re.sub(pattern, rep, content)
            if imp not in content:
                imports = [line for line in content.split('\n') if line.startswith('import ')]
                if imports:
                    content = content.replace(imports[-1], imports[-1] + "\n" + imp)

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored: {filepath}")
        return True
    return False

count = 0
for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            if process_file(os.path.join(root, file)):
                count += 1
print(f"Total files refactored: {count}")
