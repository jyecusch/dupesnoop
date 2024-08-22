package main

import (
	"context"
	"dupesnoop/pkg/files"
	"fmt"
	"os"
	"sort"

	"github.com/dustin/go-humanize"
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

// domReady is called after front-end resources have been loaded
func (a App) domReady(ctx context.Context) {
	// Add your action here
	fmt.Println("DOM is ready")
}

// beforeClose is called when the application is about to quit,
// either by clicking the window close button or calling runtime.Quit.
// Returning true will cause the application to continue, false will continue shutdown as normal.
func (a *App) beforeClose(ctx context.Context) (prevent bool) {
	return false
}

// shutdown is called at application termination
func (a *App) shutdown(ctx context.Context) {
	// Perform your teardown here
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
	Current    int
	Total      int
	Duplicates map[string][]string
}

type FileDetails struct {
	Name string `json:"name"`
	Size string `json:"size"`
	Path string `json:"path"`
}

type ResultsPage struct {
	Current    int                      `json:"current"`
	Total      int                      `json:"total"`
	Duplicates map[string][]FileDetails `json:"duplicates"`
}

func (a *App) GetPage(page int, resultsPer int) (*ResultsPage, error) {
	fmt.Printf("Getting page %d of %d\n", page, resultsPer)
	if a.dupes == nil {
		return nil, fmt.Errorf("run FindDuplicates first")
	}

	pages := len(a.dupes) / resultsPer

	if page > pages {
		return nil, fmt.Errorf("page out of range")
	}

	start := page * resultsPer
	end := start + resultsPer

	fmt.Printf("Getting page %d of %d\n", page, pages)
	fmt.Printf("Start: %d, End: %d\n", start, end)

	keys := make([]string, 0, len(a.dupes))
	for k := range a.dupes {
		keys = append(keys, k)
	}

	sort.Strings(keys)

	i := 0
	dupes := make(map[string][]FileDetails, resultsPer)
	for _, k := range keys {
		for _, file := range a.dupes[k] {
			if file.Path == "" {
				continue
			}
			if i >= start && i < end {
				dupes[k] = append(dupes[k], file)
			}
			i++
			if i >= end {
				break
			}
		}
		if i >= end {
			break
		}
	}

	return &ResultsPage{
		Current:    page,
		Total:      pages,
		Duplicates: dupes,
	}, nil
}

func (a *App) DeleteFile(filePath string) error {

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

func (a *App) FindDuplicates(dir string, page int, resultsPer int) (*ResultsPage, error) {
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

	a.dupes = make(map[string][]FileDetails, len(dupes))

	for hash, files := range dupes {
		a.dupes[hash] = make([]FileDetails, len(files))
		for _, file := range files {
			a.dupes[hash] = append(a.dupes[hash], FileDetails{
				Name: file.Name(),
				Size: humanize.Bytes(uint64(file.Size())),
				Path: file.Path,
			})
		}
	}

	return a.GetPage(page, resultsPer)
}
