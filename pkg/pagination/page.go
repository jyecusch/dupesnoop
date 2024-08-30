package pagination

type Page[T any] struct {
	Items      []T `json:"items"`
	Number     int `json:"number"`
	TotalItems int `json:"total_items"`
	TotalPages int `json:"total_pages"`
}
