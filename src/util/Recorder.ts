import { ElementPosition, StreamSize } from "@/store/Types";
import streamSaver from "streamsaver";
// eslint-disable-next-line
// @ts-ignore
import * as ponyfill from "web-streams-polyfill/ponyfill";
streamSaver.WritableStream = ponyfill.WritableStream;

export type Location = { x: number; y: number; width: number; height: number };

export default class Recorder {
  private recorder!: MediaRecorder;

  private webcamLocation: Location;
  private readonly screenLocation: Location;
  private readonly screenStream?: MediaStream;
  private readonly webcamStream?: MediaStream;
  private readonly audioTracks: MediaStreamTrack[];
  private readonly finishCallback: (blob?: Blob) => void;
  private readonly chunks: Blob[];
  private readonly streamToFile: boolean;
  private isRecording: boolean;

  constructor(options: {
    webcamLocation: Location;
    screenSize: StreamSize;
    screenStream?: MediaStream;
    webcamStream?: MediaStream;
    audioTracks: MediaStreamTrack[];
    finishCallback: (blob?: Blob) => void;
    streamToFile: boolean;
  }) {
    this.webcamLocation = options.webcamLocation;
    this.screenStream = options.screenStream;
    this.webcamStream = options.webcamStream;
    this.finishCallback = options.finishCallback;
    this.chunks = [];
    this.isRecording = false;
    this.streamToFile = options.streamToFile;
    this.audioTracks = options.audioTracks;

    this.screenLocation = {
      x: 0,
      y: 0,
      ...options.screenSize
    };
  }

  public startRecording() {
    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = this.screenLocation.width;
    targetCanvas.height = this.screenLocation.height;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const canvasCtx = targetCanvas.getContext("2d", {
      alpha: false
    })!;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvasStream: MediaStream = (targetCanvas as any).captureStream();

    if (this.audioTracks.length <= 1) {
      this.audioTracks.forEach(track => {
        canvasStream.addTrack(track);
      });
    } else {
      // Mux them together
      const audioContext = new AudioContext();
      const audioStream = audioContext.createMediaStreamDestination();
      this.audioTracks.forEach(track => {
        audioContext
          .createMediaStreamSource(new MediaStream([track]))
          .connect(audioStream);
      });
      canvasStream.addTrack(audioStream.stream.getAudioTracks()[0]);
    }

    this.drawToCanvas(canvasCtx);

    this.recorder = new MediaRecorder(canvasStream, {
      videoBitsPerSecond: 9000000
    });

    if (this.streamToFile) {
      this.startStreamToFile();
    } else {
      this.recorder.ondataavailable = event => {
        this.chunks.push(event.data);
      };
    }

    this.recorder.onstop = () => {
      this.isRecording = false;
      if (this.streamToFile) {
        this.finishCallback(undefined);
      } else {
        this.finishCallback(
          new Blob(this.chunks, { type: this.chunks[0].type })
        );
      }
    };
    this.isRecording = true;

    this.recorder.start();
  }

  private startStreamToFile() {
    const now = new Date();
    let fileName = now.getFullYear() + "-" + (now.getMonth() + 1);
    fileName += "-" + now.getDate();
    fileName += " ";
    fileName += now.getHours() + " " + now.getMinutes();
    fileName += ".webm";

    const writableStream = streamSaver.createWriteStream(fileName);

    this.recorder.ondataavailable = event => {
      // less optimized
      const writer = writableStream.getWriter();
      const reader = event.data.stream().getReader();
      const pump = () => {
        reader
          .read()
          .then(res =>
            res.done ? writer.close() : writer.write(res.value).then(pump)
          );
      };

      pump();
    };
  }

  private drawToCanvas(canvasCtx: CanvasRenderingContext2D) {
    let screenVideo: HTMLVideoElement | undefined;
    if (this.screenStream) {
      screenVideo = document.createElement("video");
      screenVideo.srcObject = this.screenStream;
      screenVideo.muted = true;
      screenVideo.play();
    }

    let webcamVideo: HTMLVideoElement | undefined;
    if (this.webcamStream) {
      webcamVideo = document.createElement("video");
      webcamVideo.srcObject = this.webcamStream;
      webcamVideo.muted = true;
      webcamVideo.play();
    } else {
      webcamVideo = undefined;
    }

    const animationCallback = () => {
      if (screenVideo) {
        canvasCtx.drawImage(
          screenVideo,
          this.screenLocation.x,
          this.screenLocation.y,
          this.screenLocation.width,
          this.screenLocation.height
        );
      } else {
        canvasCtx.clearRect(
          0,
          0,
          this.screenLocation.width,
          this.screenLocation.height
        );
      }

      if (webcamVideo) {
        canvasCtx.drawImage(
          webcamVideo,
          this.webcamLocation.x,
          this.webcamLocation.y,
          this.webcamLocation.width,
          this.webcamLocation.height
        );
      }

      if (this.isRecording) {
        window.requestAnimationFrame(animationCallback);
      } else {
        if (webcamVideo) {
          webcamVideo.pause();
        }
        if (screenVideo) {
          screenVideo.pause();
        }
      }
    };

    window.requestAnimationFrame(animationCallback);
  }

  public setWebcamLocation(location: ElementPosition) {
    this.webcamLocation = location;
  }

  public stopRecording() {
    this.recorder.stop();
  }
}
