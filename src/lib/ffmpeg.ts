import { FFmpeg } from "@ffmpeg/ffmpeg";

export const createFFmpeg = async () => {
	const ffmpeg = new FFmpeg();
	await ffmpeg.load({
		coreURL: new URL("/scripts/ffmpeg-core.js", import.meta.url).href,
		wasmURL: new URL("/scripts/ffmpeg-core.wasm", import.meta.url).href,
		// workerURL: new URL("/scripts/ffmpeg-core.worker.js", import.meta.url).href,
	});
	return ffmpeg;
};
