import os
import glob

# Hardcoded hex replacements
replacements = {
    'bg-[#0a0a0a]': 'bg-background',
    'bg-[#0B1220]': 'bg-card',
    'from-[#0B1220]': 'from-card',
    'via-[#0B1220]': 'via-card',
    'to-[#0B1220]': 'to-card',
    'bg-[#071225]': 'bg-background',
    'bg-[#050b18]': 'bg-background',
    'bg-[#0F172A]': 'bg-card',
    'bg-[#111827]': 'bg-card',
    'bg-[#020817]': 'bg-background',
    'bg-[#1E293B]': 'bg-accent',
    'bg-[#F8FAFC]': 'bg-card',
    'border-[#1F2937]': 'border-border',
    'border-[#E5E7EB]': 'border-border',
    'border-white/10': 'border-border',
    'border-white/20': 'border-border',
    'text-[#64748B]': 'text-muted-foreground',
    'text-[#CBD5E1]': 'text-muted-foreground',
    'text-[#F8FAFC]': 'text-foreground',
}

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True)

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    for target, replacement in replacements.items():
        content = content.replace(target, replacement)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")
