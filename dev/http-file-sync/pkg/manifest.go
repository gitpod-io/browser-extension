package pkg

type FileManifest struct {
	Files []FileEntry `json:"files"`
}

type FileEntry struct {
	Name         string `json:"name"`
	LastModified string `json:"lastModified"`
}
