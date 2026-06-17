import os
import re

directories = [
    'src/app/(admin)',
    'src/app/(dashboard)',
    'src/components/layout',
    'src/components/shared/AdminDataTable.tsx',
    'src/components/shared/DashboardLayout.tsx',
    'src/components/dashboard'
]

# Mapping of hardcoded Tailwind classes to semantic variables
replacements = {
    r'bg-\[\#0a0a0a\]': 'bg-background',
    r'bg-\[\#0B1220\]': 'bg-card',
    r'bg-\[\#071225\]': 'bg-background',
    r'bg-\[\#050b18\]': 'bg-background',
    r'bg-\[\#0F172A\]': 'bg-card',
    r'bg-\[\#111827\]': 'bg-card',
    r'bg-\[\#020817\]': 'bg-background',
    r'bg-\[\#1E293B\]': 'bg-accent',
    
    r'border-\[\#1F2937\]': 'border-border',
    r'border-white/10': 'border-border',
    r'border-white/20': 'border-border',
    r'border-gray-800': 'border-border',
    r'border-gray-700': 'border-border',
    
    r'text-white': 'text-foreground',
    r'text-gray-400': 'text-muted-foreground',
    r'text-gray-300': 'text-muted-foreground',
    r'text-gray-200': 'text-foreground',
    r'text-gray-100': 'text-foreground',
    r'text-\[\#9CA3AF\]': 'text-muted-foreground',
    
    # Do not replace text-white inside buttons blindly, but for layout text it's usually okay.
    # We will use regex to avoid replacing text-white if it's right next to bg-brand-orange or bg-blue-500 etc.
    # Actually, simpler is just to do global replace, then manually fix if anything breaks. Let's do selective replace.
}

def process_file(filepath):
    if not filepath.endswith('.tsx') and not filepath.endswith('.ts'):
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # We shouldn't replace text-white blindly because of buttons.
    # We will only replace the structural colors for now.
    structural_replacements = {
        r'bg-\[\#0a0a0a\]': 'bg-background',
        r'bg-\[\#0B1220\]': 'bg-card',
        r'bg-\[\#071225\]': 'bg-background',
        r'bg-\[\#050b18\]': 'bg-background',
        r'bg-\[\#0F172A\]': 'bg-card',
        r'border-white/10': 'border-border',
        r'border-white/20': 'border-border',
        r'border-gray-800': 'border-border',
        r'bg-gray-900': 'bg-background',
        r'bg-gray-800': 'bg-card',
    }

    for pattern, replacement in structural_replacements.items():
        content = re.sub(pattern, replacement, content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

for d in directories:
    if os.path.isfile(d):
        process_file(d)
    elif os.path.isdir(d):
        for root, _, files in os.walk(d):
            for file in files:
                process_file(os.path.join(root, file))
