version = "1.0.0"
url = "https://github.com/Daniel4-Scratch/gziptool"

try:

    import gzip
    import os
    import sys

    from datetime import datetime

    current_time = datetime.now()


    def create_custom_gzip_archive(output_file, *input_files):
        """
        Archives multiple files into a single custom .gz file.
        
        :param output_file: Path to the output .gz file.
        :param input_files: List of input files to archive.
        """
        with gzip.open(output_file, 'wb') as f_out:
            for file in input_files:
                # Write the file name and size as metadata
                file_name = os.path.basename(file)
                file_size = os.path.getsize(file)
                f_out.write(f"{file_name}\n".encode('utf-8'))  # Write file name
                f_out.write(f"{file_size}\n".encode('utf-8'))  # Write file size
                
                # Write the file content
                with open(file, 'rb') as f_in:
                    f_out.write(f_in.read())

    def extract_custom_gzip_archive(input_file, output_dir):
        """
        Extracts files from a custom .gz archive.
        
        :param input_file: Path to the input .gz file.
        :param output_dir: Directory to extract files into.
        """
        os.makedirs(output_dir, exist_ok=True)
        with gzip.open(input_file, 'rb') as f_in:
            while True:
                # Read file name
                file_name = f_in.readline().decode('utf-8').strip()
                if not file_name:
                    break  # End of archive
                
                # Read file size
                file_size = int(f_in.readline().decode('utf-8').strip())
                
                # Read file content
                file_content = f_in.read(file_size)
                
                # Write the extracted file
                output_file_path = os.path.join(output_dir, file_name)
                with open(output_file_path, 'wb') as f_out:
                    f_out.write(file_content)

    def extract_custom_gzip_archive_to_memory(input_file):
        """
        Extracts files from a custom .gz archive into memory.

        :param input_file: Path to the input .gz file.
        :return: Dictionary with file names as keys and file contents (bytes) as values.
        """
        extracted_files = {}
        with gzip.open(input_file, 'rb') as f_in:
            while True:
                # Read file name
                file_name = f_in.readline().decode('utf-8').strip()
                if not file_name:
                    break  # End of archive
                
                # Read file size
                file_size = int(f_in.readline().decode('utf-8').strip())
                
                # Read file content
                file_content = f_in.read(file_size)
                
                # Store in dictionary
                extracted_files[file_name] = file_content
        return extracted_files


    def isListFiles(list):
        for file in list:
            if not os.path.isfile(file):
                return False
        return True

    def isFileGz(file):
        ## Check if file is a .gz file without using the file extension to tell
        with open(file, 'rb') as f:
            return f.read(2) == b'\x1f\x8b'

    if __name__ == '__main__':
        if len(sys.argv) > 3 and sys.argv[1] == 'archive':
            create_custom_gzip_archive(sys.argv[2], *sys.argv[3:])
        elif len(sys.argv) > 3 and sys.argv[1] == 'unarchive':
            extract_custom_gzip_archive(sys.argv[2], sys.argv[3]) 
        elif len(sys.argv) > 2 and isListFiles(sys.argv[1:]):
            create_custom_gzip_archive("archive_"+str(current_time.strftime('%d-%m-%Y-%H-%M-%S')), *sys.argv[1:])
        elif len(sys.argv) == 2 and isFileGz(sys.argv[1]):
            extract_custom_gzip_archive(sys.argv[1], "unarchive_"+str(os.path.basename(sys.argv[1])))
        elif len(sys.argv) == 2 and sys.argv[1] == 'info':
            print(version)
            print(url)
        else:
            print("Invalid arguments")
            print("Archive: python main.py archive <output_file> <input_files> ...")
            print("Unarchive: python main.py unarchive <input_file> <output_dir>")

except Exception as e:
    open("error.log", "w").write(str(e))
    if sys.platform == "win32":
        os.system("notepad.exe error.log")
    else:
        print("An error occurred. Check error.log in the cwd for details.")