build:
	@echo "Building..."
	wails build

build-macos:
	@echo "Building for MacOS..."
	wails build --clean --platform darwin/universal

build-macos-intel:
	@echo "Building for MacOS Intel..."
	wails build --clean --platform darwin

build-macos-arm:
	@echo "Building for MacOS ARM..."
	wails build --clean --platform darwin/arm64

build-windows:
	@echo "Building for Windows..."
	wails build --clean --platform windows/amd64

fmt:
	@echo "Formatting..."
	go fmt ./...

lint:
	@echo "Linting..."
	golangci-lint run

test:
	@echo "Testing..."
	go test -v ./...

tidy:
	@echo "Tidying..."
	go mod tidy

run:
	@echo "Running..."
	wails dev

.PHONY: build build-macos build-macos-intel build-macos-arm build-windows