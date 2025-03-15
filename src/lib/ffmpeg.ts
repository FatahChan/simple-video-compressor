import { FFmpeg } from "@ffmpeg/ffmpeg";

export const createFFmpeg = async () => {
	const ffmpeg = new FFmpeg();
	await ffmpeg.load();
	console.log("FFmpeg loaded");
	return ffmpeg;
};
