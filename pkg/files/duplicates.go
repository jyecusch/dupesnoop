package files

import (
	"context"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/spf13/afero"
)

type StatusOptions struct {
	Progress   chan<- ProgressUpdate
	Duplicates chan<- map[string][]string
}

type ProgressUpdate struct {
	Status    string `json:"status"`
	Total     int    `json:"total"`
	Processed int    `json:"processed"`
	Current   string `json:"current"`
}

func FindDuplicates(fs afero.Fs, ctx context.Context, dir string, opts StatusOptions) (map[string][]*ComparableFile, error) {
	count := 0
	if opts.Progress != nil {
		opts.Progress <- ProgressUpdate{
			Status: "counting",
		}

		err := afero.Walk(fs, dir, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				fmt.Printf("Error counting files, path: %s, error: %s\n", path, err)
				return err
			}
			if info.Mode().IsRegular() {
				count++
				opts.Progress <- ProgressUpdate{
					Status: "counting",
					Total:  count,
				}
			}
			return nil
		})
		if err != nil {
			fmt.Printf("Error counting files: %s\n", err)
			return nil, err
		}

		fmt.Printf("Found %d files\n", count)
	}

	processed := 0

	fileBySize := make(map[int64][]*ComparableFile)
	fileByHash := make(map[string][]*ComparableFile)

	fmt.Println("Processing files")
	opts.Progress <- ProgressUpdate{
		Status: "processing",
		Total:  count,
	}

	err := afero.Walk(fs, dir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("Error walking directory: %s\n", err)
			return err
		}

		if !info.Mode().IsRegular() {
			fmt.Println("Skipping directory", path)
			return nil
		}

		processed++
		if opts.Progress != nil {
			opts.Progress <- ProgressUpdate{
				Status:    "processing",
				Total:     count,
				Processed: processed,
				Current:   path,
			}
		}

		if info.Size() == 0 {
			return nil
		}

		file := ComparableFile{
			FileInfo: info,
			Path:     path,
		}

		if fileBySize[info.Size()] == nil {
			fileBySize[info.Size()] = []*ComparableFile{
				&file,
			}
		} else {
			fileBySize[info.Size()] = append(fileBySize[info.Size()], &file)

			hash := hex.EncodeToString(file.GetHashSafe(fs))

			if fileByHash[hash] == nil {
				fileByHash[hash] = []*ComparableFile{}

				for _, f := range fileBySize[info.Size()] {
					otherHash := hex.EncodeToString(f.GetHashSafe(fs))

					if otherHash == hash {
						fileByHash[hash] = append(fileByHash[hash], f)
					}
				}
			} else {
				fileByHash[hex.EncodeToString(file.GetHashSafe(fs))] = append(fileByHash[hex.EncodeToString(file.GetHashSafe(fs))], &file)
			}
		}

		return nil
	})

	// Delete hash keys with only one file, they are not duplicates
	for hash, files := range fileByHash {
		if len(files) == 1 {
			delete(fileByHash, hash)
		}
	}

	if err != nil {
		fmt.Printf("Error walking directory: %s\n", err)
		opts.Progress <- ProgressUpdate{
			Status: "error",
		}
		return nil, err
	}

	fmt.Println("Done processing files")
	opts.Progress <- ProgressUpdate{
		Status:    "done",
		Processed: count,
		Total:     count,
	}

	return fileByHash, nil
}

// func FindDuplicatesThreaded(fs afero.Fs, dir string) {

// 	afero.Walk(fs, dir, func(path string, info os.FileInfo, err error) error {
// 		if err != nil {
// 			fmt.Printf("Error walking directory: %s\n", err)
// 			return err
// 		}

// 		if !info.Mode().IsRegular() {
// 			fmt.Println("Skipping directory", path)
// 			return nil
// 		}

// 		return nil
// 	})

// }
