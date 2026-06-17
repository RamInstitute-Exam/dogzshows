import os

files_to_check = [
    r"src\app\(dashboard)\dashboard\dogs\[id]\page.tsx",
    r"src\app\(dashboard)\dashboard\events\[id]\register\page.tsx",
    r"src\app\(public)\dogs\[id]\page.tsx",
    r"src\app\(public)\events\[slug]\page.tsx",
    r"src\app\(public)\gallery\videos\[slug]\page.tsx",
    r"src\app\(public)\groups\[slug]\page.tsx"
]

for file_path in files_to_check:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "generateStaticParams" in content:
        print(f"Skipping {file_path} (already has generateStaticParams)")
        continue
        
    if "'use client'" in content or '"use client"' in content:
        print(f"Splitting {file_path}")
        dir_name = os.path.dirname(file_path)
        client_file = os.path.join(dir_name, "Client.tsx")
        
        # Write client file
        with open(client_file, "w", encoding="utf-8") as f:
            f.write(content)
            
        # Write server file
        server_content = """import Client from './Client';

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <Client />;
}
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(server_content)
        print(f"Successfully split {file_path}")
    else:
        print(f"Skipping {file_path} (not a client component, please check manually)")
