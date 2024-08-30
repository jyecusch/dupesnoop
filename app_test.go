package main

import "testing"

func TestTotalPages(t *testing.T) {
	tests := []struct {
		name     string
		total    int
		perPage  int
		expected int
	}{
		{
			name:     "total 0 perPage 0",
			total:    0,
			perPage:  0,
			expected: 0,
		},
		{
			name:     "total 1 perPage 0",
			total:    1,
			perPage:  0,
			expected: 1,
		},
		{
			name:     "total 0 perPage 1",
			total:    0,
			perPage:  1,
			expected: 0,
		},
		{
			name:     "total 1 perPage 1",
			total:    1,
			perPage:  1,
			expected: 1,
		},
		{
			name:     "total 1 perPage 2",
			total:    1,
			perPage:  2,
			expected: 1,
		},
		{
			name:     "total 2 perPage 1",
			total:    2,
			perPage:  1,
			expected: 2,
		},
		{
			name:     "total 2 perPage 2",
			total:    2,
			perPage:  2,
			expected: 1,
		},
		{
			name:     "total 3 perPage 2",
			total:    3,
			perPage:  2,
			expected: 2,
		},
		{
			name:     "total 4 perPage 2",
			total:    4,
			perPage:  2,
			expected: 2,
		},
		{
			name:     "total 5 perPage 2",
			total:    5,
			perPage:  2,
			expected: 3,
		},
		{
			name:     "total 6 perPage 2",
			total:    6,
			perPage:  2,
			expected: 3,
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			actual := totalPages(test.total, test.perPage)
			if actual != test.expected {
				t.Errorf("expected %d, got %d", test.expected, actual)
			}
		})
	}
}
