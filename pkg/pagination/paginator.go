package pagination

import "fmt"

type Paginator[T any] struct {
	iter    Iterator[T]
	perPage int
}

func NewPaginator[T any](iter Iterator[T], perPage int) *Paginator[T] {
	return &Paginator[T]{
		iter:    iter,
		perPage: perPage,
	}
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

func (p *Paginator[T]) TotalPages() int {
	if p.iter == nil {
		return 0
	}

	return totalPages(p.iter.Len(), p.perPage)
}

// Page returns the items for the specified page, pages are 0-indexed.
func (p *Paginator[T]) Page(pageNum int) (*Page[T], error) {
	if pageNum < 0 {
		return nil, fmt.Errorf("page must be greater than 0")
	}

	if p.iter == nil {
		return nil, fmt.Errorf("no iterator provided")
	}

	if p.TotalPages() == 0 && pageNum == 0 {
		return &Page[T]{
			Items:      []T{},
			Number:     pageNum,
			TotalItems: 0,
			TotalPages: 0,
		}, nil
	}

	if (pageNum + 1) > p.TotalPages() {
		return nil, fmt.Errorf("page out of range")
	}

	// jump to the start of the page
	start := (pageNum) * p.perPage
	err := p.iter.JumpTo(start)
	if err != nil {
		return nil, err
	}

	page := &Page[T]{
		Number:     pageNum,
		TotalItems: p.iter.Len(),
		TotalPages: p.TotalPages(),
		Items:      make([]T, 0, p.perPage),
	}

	// collect items until the end of the page
	for i := 0; i < p.perPage && p.iter.HasNext(); i++ {
		page.Items = append(page.Items, p.iter.Next())
	}

	return page, nil
}
