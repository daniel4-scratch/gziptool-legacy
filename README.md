# gziptool
A simple tool to archive and unarchive files using the gzip algorithm.

# Building
## Python
Using pyinstaller:
```
pip install pyinstaller
pyinstaller --noconfirm --onefile --console --name "gziptool" "main.py"
```
## Javascript
Using pkg:
```
npm install -g pkg
pkg index.js --targets node16-linux-x64,node16-macos-x64,node16-win-x64
```