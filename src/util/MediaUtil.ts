export async function getWebcam(): Promise<MediaStream> {
  return await navigator.mediaDevices.getUserMedia({
    video: true
  });
}

export async function getMicrophone(): Promise<MediaStream> {
  return await navigator.mediaDevices.getUserMedia({
    audio: true
  });
}

export async function getScreen(): Promise<MediaStream> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return await (navigator.mediaDevices as any).getDisplayMedia({
    video: true,
    audio: false
  });
}

export function streamDimensions(
  stream: MediaStream
): { width: number; height: number } {
  return {
    width: stream.getVideoTracks()[0].getSettings().width || 0,
    height: stream.getVideoTracks()[0].getSettings().height || 0
  };
}
