#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <filesystem>
#include <chrono>
#include <sstream>
#include <zlib.h>

namespace fs = std::filesystem;

const std::string version = "1.0.0";
const std::string url = "https://github.com/Daniel4-Scratch/gziptool";

bool isGzipFile(const std::string& file) {
    std::ifstream f(file, std::ios::binary);
    char header[2];
    f.read(header, 2);
    return header[0] == '\x1f' && header[1] == '\x8b';
}

bool allFilesExist(const std::vector<std::string>& files) {
    for (const auto& file : files) {
        if (!fs::is_regular_file(file)) return false;
    }
    return true;
}

std::string getCurrentTimestamp() {
    auto now = std::chrono::system_clock::now();
    std::time_t t = std::chrono::system_clock::to_time_t(now);
    std::tm* tm_ptr = std::localtime(&t);
    char buffer[20];
    std::strftime(buffer, sizeof(buffer), "%d-%m-%Y-%H-%M-%S", tm_ptr);
    return std::string(buffer);
}

void writeGzip(const std::string& output, const std::vector<std::string>& inputFiles) {
    gzFile out = gzopen(output.c_str(), "wb");
    if (!out) throw std::runtime_error("Failed to open output file.");

    for (const auto& path : inputFiles) {
        std::ifstream in(path, std::ios::binary);
        if (!in) throw std::runtime_error("Failed to read file: " + path);

        std::string name = fs::path(path).filename().string();
        std::vector<char> content((std::istreambuf_iterator<char>(in)), {});

        std::string header = name + "\n" + std::to_string(content.size()) + "\n";
        gzwrite(out, header.c_str(), header.size());
        gzwrite(out, content.data(), content.size());
    }

    gzclose(out);
}

void extractGzip(const std::string& input, const std::string& outputDir) {
    fs::create_directories(outputDir);
    gzFile in = gzopen(input.c_str(), "rb");
    if (!in) throw std::runtime_error("Failed to open input file.");

    char buffer[4096];
    while (true) {
        std::string name, sizeStr;
        char c;
        // Read name
        while (gzread(in, &c, 1) == 1 && c != '\n') name += c;
        if (name.empty()) break;

        // Read size
        while (gzread(in, &c, 1) == 1 && c != '\n') sizeStr += c;
        size_t size = std::stoul(sizeStr);

        std::vector<char> content(size);
        gzread(in, content.data(), size);

        std::ofstream out(outputDir + "/" + name, std::ios::binary);
        out.write(content.data(), size);
    }

    gzclose(in);
}

int main(int argc, char* argv[]) {
    try {
        if (argc > 3 && std::string(argv[1]) == "archive") {
            std::vector<std::string> files(argv + 3, argv + argc);
            writeGzip(argv[2], files);
        } else if (argc > 3 && std::string(argv[1]) == "unarchive") {
            extractGzip(argv[2], argv[3]);
        } else if (argc > 2 && allFilesExist(std::vector<std::string>(argv + 1, argv + argc))) {
            std::string name = "archive_" + getCurrentTimestamp() + ".gz";
            writeGzip(name, std::vector<std::string>(argv + 1, argv + argc));
        } else if (argc == 2 && isGzipFile(argv[1])) {
            std::string dir = "unarchive_" + fs::path(argv[1]).stem().string();
            extractGzip(argv[1], dir);
        } else if (argc == 2 && std::string(argv[1]) == "info") {
            std::cout << version << "\n" << url << "\n";
        } else {
            std::cerr << "Invalid arguments\n";
            std::cerr << "Archive: ./gziptool archive <output.gz> <input files...>\n";
            std::cerr << "Unarchive: ./gziptool unarchive <input.gz> <output dir>\n";
        }
    } catch (const std::exception& e) {
        std::ofstream log("error.log");
        log << e.what();
#ifdef _WIN32
        system("notepad.exe error.log");
#else
        std::cerr << "An error occurred. Check error.log.\n";
#endif
    }
}
