package files

import (
	"crypto/sha256"
	"hash/crc32"
	"io"
	"os"

	"github.com/cespare/xxhash"
)

type ComparableFile struct {
	os.FileInfo
	Path string
	hash []byte
}

// func (a *ComparableFile) GetSize() (int64, error) {
// 	if a.size == nil {
// 		size, err := getFileSize(a.Path)
// 		if err != nil {
// 			return 0, err
// 		}

// 		a.size = &size
// 	}

// 	return *a.size, nil
// }

// func (a *ComparableFile) GetSizeSafe() int64 {
// 	size, err := a.GetSize()
// 	if err != nil {
// 		return 0
// 	}

// 	return size
// }

func (a *ComparableFile) GetHash() ([]byte, error) {
	if a.hash == nil {
		hash, err := HashFileXXHash(a.Path)
		if err != nil {
			return nil, err
		}

		a.hash = hash
	}

	return a.hash, nil
}

func (a *ComparableFile) GetHashSafe() []byte {
	hash, err := a.GetHash()
	if err != nil {
		return nil
	}

	return hash
}

// HashFileSHA256 computes the SHA-256 hash of a file.
// It is cryptographically secure, but slow.
func HashFileSHA256(filePath string) ([]byte, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return nil, err
	}

	return hasher.Sum(nil), nil
}

// HashFileXXHash computes the XXHash hash of a file.
// It's extremely fast, but not cryptographically secure.
func HashFileXXHash(filePath string) ([]byte, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	hasher := xxhash.New()
	if _, err := io.Copy(hasher, file); err != nil {
		return nil, err
	}

	return hasher.Sum(nil), nil
}

// HashFileCRC32 computes the CRC32 hash of a file, this is faster than SHA-256.
// It is not cryptographically secure, but it is good enough for duplicate detection, when speed is important.
func HashFileCRC32(filePath string) (uint32, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, err
	}
	defer file.Close()

	table := crc32.MakeTable(crc32.IEEE)
	hasher := crc32.New(table)
	if _, err := io.Copy(hasher, file); err != nil {
		return 0, err
	}

	return hasher.Sum32(), nil
}
