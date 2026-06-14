import os
import re

src_dir = r"d:\Our Projects\DogProfileApp\frontend\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "http://localhost:5001" not in content:
        return False
        
    # Example Regex: const res = await fetch('http://localhost:5001/api/v1/dogs', { headers: ... }); const data = await res.json();
    # This is quite hard to do purely with regex reliably across different formats.
    # Instead, let's just do manual replacements for exact blocks we expect.
    
    replacements = [
        (
            r"const res = await fetch\(`?http://localhost:5001/api/v1/dashboard/stats`?(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await DashboardService.getStats();",
            "import { DashboardService } from '@/services/dashboard.service';"
        ),
        (
            r"const res = await fetch\(`?http://localhost:5001/api/v1/dashboard/admin/stats`?(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await DashboardService.getAdminStats();",
            "import { DashboardService } from '@/services/dashboard.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/competitions/matches'(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await CompetitionService.getMatches();",
            "import { CompetitionService } from '@/services/competition.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/competitions/matches/score', {\s*method: 'PATCH',\s*headers: [^}]+},\s*body: JSON\.stringify\(([^)]+)\)\s*}\);\s*const data = await res\.json\(\);",
            r"const data = await CompetitionService.scoreMatch(\1);",
            "import { CompetitionService } from '@/services/competition.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/events/upcoming'(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await EventService.getUpcomingEvents();",
            "import { EventService } from '@/services/event.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/events/' \+ eventId(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await EventService.getEvent(eventId);",
            "import { EventService } from '@/services/event.service';"
        ),
        (
             r"const res = await fetch\(`http://localhost:5001/api/v1/events/\$\{eventId\}`(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await EventService.getEvent(eventId);",
            "import { EventService } from '@/services/event.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/dogs'(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await DogService.getDogs();",
            "import { DogService } from '@/services/dog.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/clubs'(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await ClubService.getClubs();",
            "import { ClubService } from '@/services/club.service';"
        ),
        (
            r"const res = await fetch\('http://localhost:5001/api/v1/breeds'(?:, [^\)]+)?\);\s*const data = await res\.json\(\);",
            "const data = await FciService.getBreeds();",
            "import { FciService } from '@/services/fci.service';"
        )
    ]
    
    modified = False
    for pattern, replacement, imp in replacements:
        if re.search(pattern, content):
            # First, add import if not exists
            if imp not in content:
                # Add after last import or at top
                imports = [line for line in content.split('\\n') if line.startswith('import ')]
                if imports:
                    last_import = imports[-1]
                    content = content.replace(last_import, last_import + '\\n' + imp)
                else:
                    content = imp + '\\n' + content
            
            # Remove any 'const token = localStorage.getItem...' if it precedes it (since axios handles it)
            content = re.sub(r"const token = localStorage\.getItem\('token'\);\s*" + pattern, replacement, content)
            # Replace the pattern itself
            content = re.sub(pattern, replacement, content)
            modified = True
            
    if modified:
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
