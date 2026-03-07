#!/usr/bin/env python3
"""
Rename room images to room-X-N.jpg format and print the new rooms-data.ts images arrays.
Only processes .jpg files directly inside each Room-X/ folder (not subdirectories).
"""

import os
import re

ROOMS_DIR = os.path.join(os.path.dirname(__file__), "../public/images/rooms")

# Maps folder name → room number
room_counts = {}

for room_folder in sorted(os.listdir(ROOMS_DIR)):
    room_path = os.path.join(ROOMS_DIR, room_folder)
    if not os.path.isdir(room_path) or not re.match(r"Room-\d+", room_folder):
        continue

    room_num = re.search(r"\d+", room_folder).group()

    # Only direct .jpg files (not subfolders)
    files = [
        f for f in os.listdir(room_path)
        if f.lower().endswith(".jpg") and os.path.isfile(os.path.join(room_path, f))
    ]

    def sort_key(f):
        match = re.search(r"\((\d+)\)", f)
        num = int(match.group(1)) if match else 0
        return (num, f)

    files.sort(key=sort_key)

    print(f"\n=== Room-{room_num} ({len(files)} files) ===")
    for i, filename in enumerate(files, 1):
        old_path = os.path.join(room_path, filename)
        new_name = f"room-{room_num}-{i}.jpg"
        new_path = os.path.join(room_path, new_name)
        if old_path != new_path:
            os.rename(old_path, new_path)
            print(f"  {filename!r:45} -> {new_name}")
        else:
            print(f"  {filename!r:45} (already named correctly)")

    room_counts[room_num] = len(files)

print("\n\n=== rooms-data.ts image counts ===")
for room_num, count in sorted(room_counts.items()):
    print(f"  Room {room_num}: {count} images  (room-{room_num}-1.jpg .. room-{room_num}-{count}.jpg)")
