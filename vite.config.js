import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { resolve } from "node:path";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		TanStackRouterVite({ autoCodeSplitting: true }),
		viteReact(),
		tailwindcss(),
		crossOriginIsolation(),
		VitePWA({
			registerType: "prompt",
			injectRegister: false,

			pwaAssets: {
				disabled: false,
				config: true,
			},

			manifest: {
				short_name: "Simple Video Compressor",
				name: "Simple Video Compressor",
				icons: [
					{
						src: "favicon.ico",
						sizes: "64x64",
						type: "image/x-icon",
					},
					{
						src: "logo192.png",
						type: "image/png",
						sizes: "192x192",
					},
					{
						src: "logo512.png",
						type: "image/png",
						sizes: "512x512",
					},
				],
				screenshots: [
					{
						src: "screenshot-desktop.png",
						sizes: "3456x1984",
						type: "image/png",
						form_factor: "wide",
					},
					{
						src: "screenshot-mobile.png",
						sizes: "780x1680",
						type: "image/png",
					},
				],
				start_url: ".",
				display: "standalone",
				theme_color: "#000000",
				background_color: "#ffffff",
			},

			workbox: {
				globPatterns: ["**/*.{js,css,html,svg,png,ico,wasm}"],
				cleanupOutdatedCaches: true,
				clientsClaim: true,
				maximumFileSizeToCacheInBytes: 35 * 1024 * 1024, // 35MB
			},

			devOptions: {
				enabled: true,
				navigateFallback: "index.html",
				suppressWarnings: true,
				type: "module",
			},
		}),
		{
			name: "configure-response-headers",
			configureServer: (server) => {
				server.middlewares.use((_req, res, next) => {
					res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					next();
				});
			},
		},
	],
	test: {
		globals: true,
		environment: "jsdom",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
	},
});
