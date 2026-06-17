import os
import re

src_dir = r"d:\Our Projects\DogProfileApp\frontend\src"

replacements = [
    (r'\/judges\/\$\{([^}]+)\}', r'/judge-details?slug=${\1}'),
    (r'\/clubs\/\$\{([^}]+)\}', r'/club-details?slug=${\1}'),
    (r'\/dogs\/\$\{([^}]+)\}', r'/dog-details?id=${\1}'),
    (r'\/events\/\$\{([^}]+)\}', r'/event-details?slug=${\1}'),
    (r'\/groups\/\$\{([^}]+)\}', r'/group-details?slug=${\1}'),
    (r'\/admin\/users\/edit\/\$\{([^}]+)\}', r'/admin/users/edit?id=${\1}'),
    (r'\/admin\/users\/\$\{([^}]+)\}', r'/admin/users/detail?id=${\1}'),
    (r'\/admin\/judges\/edit\/\$\{([^}]+)\}', r'/admin/judges/edit?id=${\1}'),
    (r'\/admin\/clubs\/edit\/\$\{([^}]+)\}', r'/admin/clubs/edit?id=${\1}'),
    (r'\/dashboard\/dogs\/\$\{([^}]+)\}', r'/dashboard/dogs/detail?id=${\1}'),
    (r'\/dashboard\/events\/\$\{([^}]+)\}\/register', r'/dashboard/events/register?id=${\1}'),
    
    (r'\/gallery\/championship-photos\/\$\{([^}]+)\}', r'/gallery/championship-photos/details?slug=${\1}'),
    (r'\/gallery\/highlights\/\$\{([^}]+)\}', r'/gallery/highlights/details?slug=${\1}'),
    (r'\/gallery\/indoor-photos\/\$\{([^}]+)\}', r'/gallery/indoor-photos/details?slug=${\1}'),
    (r'\/gallery\/interviews\/\$\{([^}]+)\}', r'/gallery/interviews/details?slug=${\1}'),
    (r'\/gallery\/outdoor-photos\/\$\{([^}]+)\}', r'/gallery/outdoor-photos/details?slug=${\1}'),
    (r'\/gallery\/outdoor-videos\/\$\{([^}]+)\}', r'/gallery/outdoor-videos/details?slug=${\1}'),
    (r'\/gallery\/personal-photos\/\$\{([^}]+)\}', r'/gallery/personal-photos/details?slug=${\1}'),
    (r'\/gallery\/personal-videos\/\$\{([^}]+)\}', r'/gallery/personal-videos/details?slug=${\1}'),
    (r'\/gallery\/photos\/\$\{([^}]+)\}', r'/gallery/photos/details?slug=${\1}'),
    (r'\/gallery\/show-photos\/\$\{([^}]+)\}', r'/gallery/show-photos/details?slug=${\1}'),
    (r'\/gallery\/show-videos\/\$\{([^}]+)\}', r'/gallery/show-videos/details?slug=${\1}'),
    (r'\/gallery\/videos\/\$\{([^}]+)\}', r'/gallery/videos/details?slug=${\1}'),
    (r'\/gallery\/winners-gallery\/\$\{([^}]+)\}', r'/gallery/winners-gallery/details?slug=${\1}'),
    (r'\/media\/category\/\$\{([^}]+)\}', r'/media/category/details?slug=${\1}')
]

# We should also replace the literal strings if they exist, e.g. href="/judges/mr-s-pathy" -> "/judge-details?slug=mr-s-pathy"
# Wait, literal strings are hard to replace with regex because we don't know the slug boundary.

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
        
    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            process_file(os.path.join(root, f))
