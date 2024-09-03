package main

import (
	"embed"

	"github.com/spf13/afero"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/linux"
	"github.com/wailsapp/wails/v2/pkg/options/mac"
)

//go:embed all:frontend/dist
var assets embed.FS

//go:embed build/appicon.png
var icon []byte

func main() {
	// Create an instance of the app structure
	application := NewApp(afero.NewOsFs())

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "Pete's DupeSnoop",
		Width:            1024,
		Height:           768,
		Assets:           assets,
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        application.startup,
		Bind: []interface{}{
			application,
		},
		Mac: &mac.Options{
			About: &mac.AboutInfo{
				Title:   "Pete's DupeSnoop",
				Message: "© 2024 Jye Cusch",
				Icon:    icon,
			},
		},
		Linux: &linux.Options{
			Icon: icon,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
