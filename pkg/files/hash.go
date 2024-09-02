package files

import (
	"crypto/sha256"
	"hash/crc32"
	"io"

	"github.com/cespare/xxhash"
	"github.com/spf13/afero"
)

// HashFileSHA256 computes the SHA-256 hash of a file.
// It is cryptographically secure, but slow.
func HashFileSHA256(fs afero.Fs, filePath string) ([]byte, error) {
	file, err := fs.Open(filePath)
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

// HashFileXXHash computes the XXHash hash of a file
// Extremely fast hash, but not cryptographically secure.
func HashFileXXHash(fs afero.Fs, filePath string) ([]byte, error) {
	file, err := fs.Open(filePath)
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
// Not cryptographically secure, but good enough for duplicate detection.
func HashFileCRC32(fs afero.Fs, filePath string) (uint32, error) {
	file, err := fs.Open(filePath)
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
