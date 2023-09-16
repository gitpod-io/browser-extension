package pkg

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/fsnotify/fsnotify"
)

func generateManifest(dir string, manifestFile string) {

	fmt.Println("Generating manifest...")

	manifest := readManifestRec([]FileEntry{}, manifestFile, dir, "")

	manifestJSON, err := json.MarshalIndent(map[string][]FileEntry{"files": manifest}, "", "  ")
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}

	err = os.WriteFile(filepath.Join(dir, manifestFile), manifestJSON, 0644)
	if err != nil {
		fmt.Println("Error writing manifest file:", err)
		return
	}
}

func readManifestRec(manifest []FileEntry, manifestFile string, baseDir string, relativePath string) []FileEntry {
	dir := filepath.Join(baseDir, relativePath)
	files, err := os.ReadDir(dir)
	if err != nil {
		fmt.Println("Error reading directory:", err)
		return manifest
	}

	for _, file := range files {
		if file.Name() == manifestFile {
			continue
		}

		info, err := file.Info()
		if err != nil {
			fmt.Println("Error getting file info:", err)
			continue
		}
		lastModified := info.ModTime().UTC().Format(time.RFC3339)
		if info.IsDir() {
			manifest = readManifestRec(manifest, manifestFile, baseDir, filepath.Join(relativePath, file.Name()))
		} else {
			manifest = append(manifest, FileEntry{Name: filepath.Join(relativePath, file.Name()), LastModified: lastModified})
		}
	}
	return manifest
}

func Serve(watchDir string, port string, manifestFile string) {

	// Create directory if it doesn't exist
	_ = os.MkdirAll(watchDir, 0755)

	// Initialize a new file watcher
	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		fmt.Println("Error creating watcher:", err)
		return
	}
	defer watcher.Close()

	// Generate initial manifest
	generateManifest(watchDir, manifestFile)

	// Watch directory
	err = watcher.Add(watchDir)
	if err != nil {
		fmt.Println("Error adding directory to watcher:", err)
		return
	}

	// File server
	go func() {
		http.Handle("/", http.FileServer(http.Dir(watchDir)))
		http.ListenAndServe(":"+port, nil)
	}()

	fmt.Printf("Serving files at http://localhost:%s\n", port)
	fmt.Printf("Please download the binary for your client OS from `.bin/` and run it in a local directory. It will auto sync and update the extension on changes\n")

	// File watcher loop
	for {
		select {
		case event, ok := <-watcher.Events:
			if !ok {
				return
			}

			if event.Op&fsnotify.Write == fsnotify.Write ||
				event.Op&fsnotify.Create == fsnotify.Create ||
				event.Op&fsnotify.Remove == fsnotify.Remove {
				if filepath.Base(event.Name) != manifestFile {
					generateManifest(watchDir, manifestFile)
				}
			}
		case err, ok := <-watcher.Errors:
			if !ok {
				return
			}
			fmt.Println("Error:", err)
		}
	}
}
