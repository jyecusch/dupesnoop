package main

import (
	"context"
	"fmt"
	"os"

	"github.com/dustin/go-humanize"
	"github.com/jyecusch/dupesnoop/pkg/files"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx   context.Context
	dupes map[string][]FileDetails
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called at application startup
func (a *App) startup(ctx context.Context) {
	// Perform your setup here
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	fmt.Println("Greeting", name)
	return fmt.Sprintf("Hello %s, It's show time!", name)
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

type Page struct {
	Current    int                 `json:"current"`
	Total      int                 `json:"total"`
	Duplicates map[string][]string `json:"duplicates"`
}

type FileDetails struct {
	Name string `json:"name"`
	Size int64  `json:"size"`
	Path string `json:"path"`
}

// type ResultsPage struct {
// 	Current    int                 `json:"current"`
// 	Total      int                 `json:"total"`
// 	Duplicates []FileDetailsResult `json:"duplicates"`
// }

type FileDetailsResult struct {
	FileDetails
	HumanSize string `json:"humanSize"`
	Hash      string `json:"hash"`
}

func totalPages(total int, perPage int) int {
	if total == 0 {
		return 0
	}

	// default to a single page containing all results
	if perPage <= 0 {
		return 1
	}

	// account for integer division causing a 'missing' page
	return (total + perPage - 1) / perPage
}

// func (a *App) GetPage(page int, resultsPer int) (*pagination.Page[FileDetailsResult], error) {
// 	fmt.Printf("Getting page %d\n", page)
// 	if a.dupes == nil {
// 		return nil, fmt.Errorf("run FindDuplicates first")
// 	}

// 	pages := totalPages(len(a.dupes), resultsPer)

// 	if page > pages {
// 		return nil, fmt.Errorf("page out of range")
// 	}

// 	start := page * resultsPer
// 	end := start + resultsPer

// 	keys := make([]string, 0, len(a.dupes))
// 	for k := range a.dupes {
// 		keys = append(keys, k)
// 	}

// 	fmt.Printf("Dupes: %v\n", a.dupes)

// 	slices.SortStableFunc(keys, func(i string, j string) int {
// 		if a.dupes[i][0].Size > a.dupes[j][0].Size {
// 			return -1
// 		} else if a.dupes[i][0].Size < a.dupes[j][0].Size {
// 			return 1
// 		}
// 		return 0
// 	})

// 	i := 0
// 	dupes := make([]FileDetailsResult, 0, resultsPer)
// 	for _, k := range keys {
// 		for _, file := range a.dupes[k] {
// 			if i >= start && i < end {
// 				dupes = append(dupes, FileDetailsResult{
// 					FileDetails: file,
// 					HumanSize:   humanize.Bytes(uint64(file.Size)),
// 					Hash:        k,
// 				})
// 			}
// 			i++
// 			if i >= end {
// 				break
// 			}
// 		}
// 		if i >= end {
// 			break
// 		}
// 	}

// 	return &ResultsPage{
// 		Current:    page,
// 		Total:      pages,
// 		Duplicates: dupes,
// 	}, nil
// }

func (a *App) DeleteFile(filePath string) error {

	// TODO: Move to trash instead.
	err := os.Remove(filePath)
	if err != nil {
		return err
	}

	// remove it from a.dupes
	for hash, files := range a.dupes {
		for i, file := range files {
			if file.Path == filePath {
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
			fmt.Println("Progress:", p)
			runtime.EventsEmit(a.ctx, "progress", p)
		}
	}()

	dupes, err := files.FindDuplicates(a.ctx, dir, opts)
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
				HumanSize: humanize.Bytes(uint64(file.Size())),
				Hash:      hash,
			})
		}
	}

	return results, nil
}
