import os
import shutil

src_app = r"d:\Our Projects\DogProfileApp\frontend\src\app"

routes = [
    (r"(public)\judges\[slug]", r"(public)\judge-details"),
    (r"(public)\clubs\[slug]", r"(public)\club-details"),
    (r"(public)\dogs\[id]", r"(public)\dog-details"),
    (r"(public)\events\[slug]", r"(public)\event-details"),
    (r"(public)\groups\[slug]", r"(public)\group-details"),
    (r"(public)\gallery\championship-photos\[slug]", r"(public)\gallery\championship-photos\details"),
    (r"(public)\gallery\highlights\[slug]", r"(public)\gallery\highlights\details"),
    (r"(public)\gallery\indoor-photos\[slug]", r"(public)\gallery\indoor-photos\details"),
    (r"(public)\gallery\interviews\[slug]", r"(public)\gallery\interviews\details"),
    (r"(public)\gallery\outdoor-photos\[slug]", r"(public)\gallery\outdoor-photos\details"),
    (r"(public)\gallery\outdoor-videos\[slug]", r"(public)\gallery\outdoor-videos\details"),
    (r"(public)\gallery\personal-photos\[slug]", r"(public)\gallery\personal-photos\details"),
    (r"(public)\gallery\personal-videos\[slug]", r"(public)\gallery\personal-videos\details"),
    (r"(public)\gallery\photos\[slug]", r"(public)\gallery\photos\details"),
    (r"(public)\gallery\show-photos\[slug]", r"(public)\gallery\show-photos\details"),
    (r"(public)\gallery\show-videos\[slug]", r"(public)\gallery\show-videos\details"),
    (r"(public)\gallery\videos\[slug]", r"(public)\gallery\videos\details"),
    (r"(public)\gallery\winners-gallery\[slug]", r"(public)\gallery\winners-gallery\details"),
    (r"(public)\media\category\[slug]", r"(public)\media\category\details"),
    (r"(admin)\admin\users\edit\[id]", r"(admin)\admin\users\edit"),
    (r"(admin)\admin\users\[id]", r"(admin)\admin\users\detail"),
    (r"(dashboard)\dashboard\dogs\[id]", r"(dashboard)\dashboard\dogs\detail"),
    (r"(dashboard)\dashboard\events\[id]\register", r"(dashboard)\dashboard\events\register")
]

for src, dest in routes:
    src_path = os.path.join(src_app, src)
    dest_path = os.path.join(src_app, dest)
    
    if os.path.exists(src_path):
        print(f"Moving {src_path} to {dest_path}")
        os.makedirs(dest_path, exist_ok=True)
        for item in os.listdir(src_path):
            shutil.move(os.path.join(src_path, item), os.path.join(dest_path, item))
        os.rmdir(src_path)
    else:
        print(f"Not found: {src_path}")
