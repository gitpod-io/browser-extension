package main

import (
	"fmt"

	"github.com/spf13/cobra"
	"gitpod.io/http-file-sync/pkg"
)

const (
	serverPort       = "8080"
	remoteURL        = "http://localhost:" + serverPort
	localDir         = "./gitpod-extension-dev"
	manifestFilename = "file-manifest.json"
)

func main() {
	// Root command (default/client-side logic)
	var rootCmd = &cobra.Command{Use: "watch-sync", Short: "Run a client that watches remote changes and syncs them locally"}
	rootCmd.Run = func(cmd *cobra.Command, args []string) {
		if len(args) > 1 {
			fmt.Println("Usage: watch-sync <command-on-update>?")
		}
		commandOnUpdate := ""
		if len(args) == 1 {
			commandOnUpdate = args[0]
		}
		pkg.WatchSync(remoteURL, localDir, manifestFilename, commandOnUpdate)
	}

	var servCmd = &cobra.Command{
		Use:   "serve <folder-to-watch>",
		Short: "Run the server logic",
		Run: func(cmd *cobra.Command, args []string) {
			if len(args) != 1 {
				fmt.Println("Please provide a folder to watch")
				fmt.Println("Usage: watch-sync serve <folder-to-watch>")
				return
			}
			pkg.Serve(args[0], serverPort, manifestFilename)
		},
	}

	// Add "serv" command as a subcommand of the root
	rootCmd.AddCommand(servCmd)

	// Execute the root command
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
	}
}
