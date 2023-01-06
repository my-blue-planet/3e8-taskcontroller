// vite.config.js
import path from "path"
import { defineConfig } from 'vite'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const _dirname = typeof __dirname !== 'undefined'
	? __dirname
	: dirname(fileURLToPath(import.meta.url))

export default {
	build: {
		lib: {
			entry: _dirname + '/src/TaskController.ts',
			name: 'TaskController',
			fileName: (format) => format === "es" ? `taskcontroller.js` : `taskcontroller.${format}.js`
		},
		rollupOptions: {},
		base: "./"
	}
}