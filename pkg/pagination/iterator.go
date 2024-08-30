package pagination

// Iterator is a generic interface for iterating over a collection of items.
type Iterator[T any] interface {
	// HasNext returns true if there are more items to iterate over.
	HasNext() bool
	// Next returns the next item in the iteration.
	Next() T
	// Reset resets the iterator to the beginning.
	Reset()
	// JumpTo skips to the specified index, starting from 0.
	JumpTo(index int) error
	// Index returns the current index.
	Index() int
	// Len returns the total number of items.
	Len() int
}
