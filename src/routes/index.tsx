import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
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
		const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
		const ffmpeg = ffmpegRef.current;
		ffmpeg.on("log", ({ message }) => {
			if (messageRef.current) {
				messageRef.current.innerHTML = message;
			}
			console.log(message);
		});
		// toBlobURL is used to bypass CORS issue, urls with the same
		// domain can be used directly.
		await ffmpeg.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.wasm`,
				"application/wasm",
			),
			workerURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.worker.js`,
				"text/javascript",
			),
		});
		setLoaded(true);
	};

	const transcode = async () => {
		const ffmpeg = ffmpegRef.current;
		await ffmpeg.writeFile(
			"input.webm",
			await fetchFile(
				"https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm",
			),
		);
		await ffmpeg.exec(["-i", "input.webm", "output.mp4"]);
		const data = await ffmpeg.readFile("output.mp4");
		if (videoRef.current) {
			videoRef.current.src = URL.createObjectURL(
				new Blob([data.buffer], { type: "video/mp4" }),
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
