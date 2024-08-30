package pagination

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
)

// MockIterator is a mock implementation of the Iterator interface for testing purposes.
type MockIterator[T any] struct {
	items    []T
	position int
}

func NewMockIterator[T any](items []T) *MockIterator[T] {
	return &MockIterator[T]{
		items:    items,
		position: 0,
	}
}

func (m *MockIterator[T]) Len() int {
	return len(m.items)
}

func (m *MockIterator[T]) HasNext() bool {
	return m.position < len(m.items)
}

func (m *MockIterator[T]) Next() T {
	item := m.items[m.position]
	m.position++
	return item
}

func (m *MockIterator[T]) JumpTo(pos int) error {
	if pos < 0 || pos >= len(m.items) {
		return errors.New("out of range")
	}
	m.position = pos
	return nil
}

func (m *MockIterator[T]) Reset() {
	m.position = 0
}

func (m *MockIterator[T]) Index() int {
	return m.position
}

func TestPaginator_TotalPages(t *testing.T) {
	items := []int{1, 2, 3, 4, 5, 6}
	iter := NewMockIterator(items)
	paginator := NewPaginator[int](iter, 2)

	assert.Equal(t, 3, paginator.TotalPages())

	paginator = NewPaginator[int](iter, 0) // perPage is 0, should default to a single page
	assert.Equal(t, 1, paginator.TotalPages())

	paginator = NewPaginator[int](nil, 2) // nil iterator
	assert.Equal(t, 0, paginator.TotalPages())

	items = append(items, 7) // test with an incomplete last page
	iter = NewMockIterator(items)
	paginator = NewPaginator[int](iter, 2)
	assert.Equal(t, 4, paginator.TotalPages())
}

func TestPaginator_Page(t *testing.T) {
	items := []int{1, 2, 3, 4, 5, 6, 7}
	iter := NewMockIterator(items)
	paginator := NewPaginator[int](iter, 2)

	page, err := paginator.Page(0)
	assert.NoError(t, err)
	assert.Equal(t, []int{1, 2}, page.Items)

	page, err = paginator.Page(1)
	assert.NoError(t, err)
	assert.Equal(t, []int{3, 4}, page.Items)

	page, err = paginator.Page(2)
	assert.NoError(t, err)
	assert.Equal(t, []int{5, 6}, page.Items)

	page, err = paginator.Page(3)
	assert.NoError(t, err)
	assert.Equal(t, []int{7}, page.Items)

	_, err = paginator.Page(4)
	assert.Error(t, err)

	_, err = paginator.Page(-1)
	assert.Error(t, err)

	// Test with a nil iterator
	paginator = NewPaginator[int](nil, 2)
	_, err = paginator.Page(0)
	assert.Error(t, err)
}

func TestPaginator_Page_Empty(t *testing.T) {

	items := []int{}
	iter := NewMockIterator(items)
	paginator := NewPaginator[int](iter, 2)

	page, err := paginator.Page(0)
	assert.NoError(t, err)
	assert.Empty(t, page.Items)
}
