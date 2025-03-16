import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [loaded, setLoaded] = useState(false);
	const ffmpegRef = useRef(new FFmpeg());
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const messageRef = useRef<HTMLParagraphElement | null>(null);

	const load = async () => {
		const ffmpeg = ffmpegRef.current;
		ffmpeg.on("log", ({ message }) => {
			if (messageRef.current) messageRef.current.innerHTML = message;
		});
		// toBlobURL is used to bypass CORS issue, urls with the same
		// domain can be used directly.
		await ffmpeg.load({
			coreURL: new URL("/scripts/ffmpeg-core.js", import.meta.url).href,
			wasmURL: new URL("/scripts/ffmpeg-core.wasm", import.meta.url).href,
			workerURL: new URL("/scripts/ffmpeg-core.worker.js", import.meta.url)
				.href,
		});
		setLoaded(true);
	};

	const transcode = async () => {
		const videoURL =
			"https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi";
		const ffmpeg = ffmpegRef.current;
		await ffmpeg.writeFile("input.avi", await fetchFile(videoURL));
		const numThreads = navigator.hardwareConcurrency
			? Math.floor(navigator.hardwareConcurrency / 2)
			: 1;
		await ffmpeg.exec([
			"-i",
			"input.avi",
			"-threads",
			`${numThreads}`,
			"output.mp4",
		]);
		console.log("Transcoding... done");
		const fileData = await ffmpeg.readFile("output.mp4");
		if (videoRef.current) {
			videoRef.current.src = URL.createObjectURL(
				new Blob([fileData], { type: "video/mp4" }),
			);
		}
	};

	return loaded ? (
		<>
			{/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
			<video ref={videoRef} controls />
			<br />
			<button onClick={transcode} type="button">
				Transcode webm to mp4
			</button>
			<p ref={messageRef} />
			<p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
		</>
	) : (
		<button onClick={load} type="button">
			Load ffmpeg-core (~31 MB)
		</button>
	);
}
