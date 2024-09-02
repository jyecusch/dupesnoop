package files

import (
	"os"

	"github.com/spf13/afero"
)

type ComparableFile struct {
	os.FileInfo
	Path string
	hash []byte
}

func (a *ComparableFile) GetHash(fs afero.Fs) ([]byte, error) {
	if a.hash == nil {
		hash, err := HashFileXXHash(fs, a.Path)
		if err != nil {
			return nil, err
		}

		a.hash = hash
	}

	return a.hash, nil
}

func (a *ComparableFile) GetHashSafe(fs afero.Fs) []byte {
	hash, err := a.GetHash(fs)
	if err != nil {
		return nil
	}

	return hash
}
