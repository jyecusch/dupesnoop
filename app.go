package main

import (
	"context"
	"fmt"
	"slices"

	"github.com/jyecusch/dupesnoop/pkg/files"
	"github.com/spf13/afero"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx   context.Context
	dupes map[string][]FileDetails
	fs    afero.Fs
}

// NewApp creates a new App application struct
func NewApp(fs afero.Fs) *App {
	if fs == nil {
		fs = afero.NewOsFs()
	}
	return &App{
		fs: fs,
	}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

func (a *App) SelectDirectory() (string, error) {
	path, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select a directory",
	})
	if err != nil {
		fmt.Println("Error selecting directory:", err)
		return "", err
	}

	if path == "" {
		fmt.Println("No directory selected")
		return "", fmt.Errorf("no directory selected")
	}

	return path, nil
}

type FileDetails struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
	Path string `json:"path"`
}

type FileDetailsResult struct {
	FileDetails
	Hash string `json:"hash"`
}

func (a *App) DeleteFiles(paths []string) error {

	// TODO: Move to trash instead.
	for _, path := range paths {
		err := a.fs.Remove(path)
		if err != nil {
			return err
		}
	}

	// remove it from a.dupes
	for hash, files := range a.dupes {
		for i, file := range files {
			if slices.Contains(paths, file.Path) {
				a.dupes[hash] = append(a.dupes[hash][:i], a.dupes[hash][i+1:]...)
				break
			}
		}
		if len(a.dupes[hash]) <= 1 {
			delete(a.dupes, hash)
		}
	}

	return nil
}

func (a *App) FindDuplicates(dir string) ([]FileDetailsResult, error) {
	progress := make(chan files.ProgressUpdate)

	opts := files.StatusOptions{
		Progress:   progress,
		Duplicates: nil,
	}

	go func() {
		// Forward progress updates to the front-end
		for p := range progress {
			runtime.EventsEmit(a.ctx, "progress", p)
		}
	}()

	dupes, err := files.FindDuplicates(a.fs, a.ctx, dir, opts)
	if err != nil {
		return nil, err
	}

	a.dupes = make(map[string][]FileDetails)

	results := []FileDetailsResult{}

	for hash, files := range dupes {
		a.dupes[hash] = make([]FileDetails, len(files))
		for _, file := range files {
			results = append(results, FileDetailsResult{
				FileDetails: FileDetails{
					Name: file.Name(),
					Size: file.Size(),
					Path: file.Path,
				},
				Hash: hash,
			})
		}
	}

	return results, nil
}
