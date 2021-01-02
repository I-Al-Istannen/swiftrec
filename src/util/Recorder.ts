import { streamDimensions } from "@/util/MediaUtil";
import { ElementPosition } from "@/store/Types";

export type Location = { x: number; y: number; width: number; height: number };

export default class Recorder {
  private recorder!: MediaRecorder;

  private webcamLocation: Location;
  private readonly screenLocation: Location;
  private readonly screenStream: MediaStream;
  private readonly webcamStream: MediaStream;
  private readonly finishCallback: (blob: Blob) => void;
  private readonly chunks: Blob[];
  private isRecording: boolean;

  constructor(
    webcamLocation: Location,
    screenStream: MediaStream,
    webcamStream: MediaStream,
    finishCallback: (blob: Blob) => void
  ) {
    this.webcamLocation = webcamLocation;
    this.screenStream = screenStream;
    this.webcamStream = webcamStream;
    this.finishCallback = finishCallback;
    this.chunks = [];
    this.isRecording = false;

    this.screenLocation = {
      x: 0,
      y: 0,
      ...streamDimensions(screenStream)
    };
  }

  public startRecording() {
    const targetCanvas = document.createElement("canvas");
    targetCanvas.width = this.screenLocation.width;
    targetCanvas.height = this.screenLocation.height;

    const canvasCtx = targetCanvas.getContext("2d", {
      alpha: false
    });

    if (!canvasCtx) {
      throw Error("Sad");
    }

    const audioTrack = this.webcamStream.getAudioTracks()[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const canvasStream: MediaStream = (targetCanvas as any).captureStream();
    canvasStream.addTrack(audioTrack);

    this.drawToCanvas(canvasCtx);

    this.recorder = new MediaRecorder(canvasStream, {
      videoBitsPerSecond: 9000000
    });

    this.recorder.ondataavailable = event => {
      this.chunks.push(event.data);
    };
    this.recorder.onstop = () => {
      this.isRecording = false;
      this.finishCallback(new Blob(this.chunks, { type: this.chunks[0].type }));
    };
    this.isRecording = true;

    this.recorder.start();
  }

  private drawToCanvas(canvasCtx: CanvasRenderingContext2D) {
    const screenVideo = document.createElement("video");
    screenVideo.srcObject = this.screenStream;
    screenVideo.muted = true;
    screenVideo.play();
    const webcamVideo = document.createElement("video");
    webcamVideo.srcObject = this.webcamStream;
    webcamVideo.muted = true;
    webcamVideo.play();

    const animationCallback = () => {
      canvasCtx.drawImage(
        screenVideo,
        this.screenLocation.x,
        this.screenLocation.y,
        this.screenLocation.width,
        this.screenLocation.height
      );

      canvasCtx.drawImage(
        webcamVideo,
        this.webcamLocation.x,
        this.webcamLocation.y,
        this.webcamLocation.width,
        this.webcamLocation.height
      );

      if (this.isRecording) {
        window.requestAnimationFrame(animationCallback);
      } else {
        webcamVideo.pause();
        screenVideo.pause();
      }
    };

    window.requestAnimationFrame(animationCallback);
  }

  public setWebcamLocation(location: ElementPosition) {
    this.webcamLocation = location;
  }

  public stopRecording() {
    if (!this.isRecording) {
      throw Error("Not recording :(");
    }
    this.recorder.stop();
  }
}
