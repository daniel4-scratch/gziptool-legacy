# gziptool
A simple tool to archive and unarchive files using the gzip algorithm.

## Prerequisites
- Python 3.x
- Pip

## Building

```
pip install -r requirements.txt
```

```
pyinstaller --noconfirm --onefile --console --name "gziptool" "main.py"
```

## CLI Usage
### Archive files
Archive multiple files into a custom .gz archive:
```
python main.py archive <output_file> <input_file1> <input_file2> ...
```
Example:
```
python main.py archive myarchive.gz file1.txt file2.jpg
```

### Unarchive files
Extract files from a custom .gz archive:
```
python main.py unarchive <input_file> <output_dir>
```
Example:
```
python main.py unarchive myarchive.gz extracted_files/
```

### Quick archive (auto-named)
Archive files with auto-generated archive name:
```
python main.py <input_file1> <input_file2> ...
```
Example:
```
python main.py file1.txt file2.jpg
```

### Quick unarchive (auto-named output dir)
Extract files from a .gz archive to an auto-named directory:
```
python main.py <input_file.gz>
```
Example:
```
python main.py myarchive.gz
```

### Show tool info
Display version and project URL:
```
python main.py info
```