import os

# Get the current working directory
root_dir = os.getcwd()

# The output file
output_file = "all_files.txt"

# Extensions to include
included_exts = {".ts", ".tsx", ".css"}

# Lists to hold file contents
included_files = []
ignored_files = []

for dirpath, dirnames, filenames in os.walk(root_dir):
    # Skip node_modules directories
    if "node_modules" in dirnames:
        dirnames.remove("node_modules")
    
    for filename in filenames:
        file_path = os.path.join(dirpath, filename)
        rel_path = os.path.relpath(file_path, root_dir)  # relative path

        ext = os.path.splitext(filename)[1].lower()
        if ext in included_exts:
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                included_files.append(f"{rel_path}\n{content}\n")
            except Exception as e:
                print(f"Error reading {file_path}: {e}")
        else:
            ignored_files.append(rel_path)

# Write to the output file
with open(output_file, "w", encoding="utf-8") as f:
    f.write("# Included files\n\n")
    for file_content in included_files:
        f.write(file_content)
        f.write("\n" + "-"*40 + "\n\n")  # separator for readability

    if ignored_files:
        f.write("# Ignored files\n\n")
        for path in ignored_files:
            f.write(path + "\n")

print(f"Done! All included files written to '{output_file}'.")
