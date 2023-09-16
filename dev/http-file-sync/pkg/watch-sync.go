package pkg

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func WatchSync(remoteUrl string, localDir string, manifestFilename string, commandOnUpdate string) {
	fmt.Printf("Watching %s/%s and sync changes to %s\n", remoteUrl, manifestFilename, localDir)
	// Create directory if it doesn't exist
	_ = os.MkdirAll(localDir, 0755)

	// Generate initial manifest
	update(remoteUrl, localDir, manifestFilename, commandOnUpdate)

	// Watch for changes
	for {
		// sleep for 2 seconds
		time.Sleep(2 * time.Second)
		update(remoteUrl, localDir, manifestFilename, commandOnUpdate)
	}
}

func update(remoteUrl string, localDir string, manifestFilename string, commandOnUpdate string) {
	localManifest := filepath.Join(localDir, "local_"+manifestFilename)

	// Download remote manifest
	resp, err := http.Get(fmt.Sprintf("%s/%s", remoteUrl, manifestFilename))
	if err != nil {
		fmt.Println("Error downloading manifest:", err)
		return
	}
	defer resp.Body.Close()

	remoteManifestData, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading manifest:", err)
		return
	}

	var remoteManifest FileManifest
	json.Unmarshal(remoteManifestData, &remoteManifest)

	// Read local manifest if exists
	localManifestData, err := os.ReadFile(localManifest)
	var localManifestMap map[string]string
	if err == nil {
		var localManifest FileManifest
		json.Unmarshal(localManifestData, &localManifest)
		localManifestMap = make(map[string]string)
		for _, entry := range localManifest.Files {
			localManifestMap[entry.Name] = entry.LastModified
		}
	}

	// Compare and download files
	for _, remoteFile := range remoteManifest.Files {
		localLastModified, exists := localManifestMap[remoteFile.Name]
		if !exists || localLastModified != remoteFile.LastModified {
			fmt.Printf("Downloading %s...\n", remoteFile.Name)

			resp, err := http.Get(fmt.Sprintf("%s/%s", remoteUrl, remoteFile.Name))
			if err != nil {
				fmt.Println("Error downloading file:", err)
				continue
			}
			defer resp.Body.Close()

			fileData, err := ioutil.ReadAll(resp.Body)
			if err != nil {
				fmt.Println("Error reading file:", err)
				continue
			}

			err = os.MkdirAll(filepath.Join(localDir, filepath.Dir(remoteFile.Name)), 0755)
			if err != nil {
				fmt.Println("Error creating directory:", err)
			}
			err = os.WriteFile(filepath.Join(localDir, remoteFile.Name), fileData, 0644)
			if err != nil {
				fmt.Println("Error writing file:", err)
			}
		}
	}

	// Save new local manifest
	err = os.WriteFile(localManifest, remoteManifestData, 0644)
	if err != nil {
		fmt.Println("Error writing local manifest:", err)
	}
}
