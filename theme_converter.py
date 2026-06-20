import os
import re

TARGET_DIR = r"d:\bala backend\frontend\src"

REPLACEMENTS = [
    # Background colors
    ("bg-slate-900", "bg-[#0A0A0A]"),
    ("bg-slate-950", "bg-black"),
    ("bg-blue-900", "bg-[#0A0A0A]"),
    ("bg-blue-950", "bg-black"),
    ("bg-navy", "bg-black"),
    ("bg-[#081120]", "bg-black"),
    ("bg-[#0B1220]", "bg-[#050505]"),
    ("bg-[#020817]", "bg-black"),
    ("bg-[#0F172A]", "bg-[#0A0A0A]"),
    ("bg-[#1E293B]", "bg-[#111111]"),
    ("bg-[rgb(5,15,35)]", "bg-black"),
    
    # Text colors
    ("text-slate-400", "text-[#B5B5B5]"),
    ("text-slate-300", "text-[#D1D1D1]"),
    
    # Gradients
    ("from-slate-900", "from-black"),
    ("to-blue-950", "to-black"),
    ("to-slate-900", "to-black"),
    ("from-blue-950", "from-black"),
    ("from-navy", "from-black"),
    ("to-navy", "to-black"),
    
    # Borders
    ("border-slate-800", "border-white/10"),
    ("border-slate-700", "border-white/10"),
    
    # Shadows
    ("shadow-[0_4px_24px_rgba(2,8,23,0.5)]", "shadow-[0_8px_24px_rgba(0,0,0,0.45)]"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    for old_str, new_str in REPLACEMENTS:
        content = content.replace(old_str, new_str)
        
    # Also replace raw rgb(5,15,35) inside styles
    content = content.replace("rgb(5,15,35)", "#000000")
    content = content.replace("rgb(5, 15, 35)", "#000000")

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated: {filepath}")

def main():
    count = 0
    for root, dirs, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith((".tsx", ".ts", ".jsx", ".js", ".css")):
                process_file(os.path.join(root, file))
                count += 1
    print(f"Finished checking {count} files.")

if __name__ == "__main__":
    main()
