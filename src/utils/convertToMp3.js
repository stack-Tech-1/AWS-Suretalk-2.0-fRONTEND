// Converts a recording to MP3 in the browser. The phone line can only play formats like MP3, while
// browsers record WebM (Chrome, Firefox) or MP4 (Safari).
// Returns the MP3 as a Blob, or null if it could not be converted, so the caller keeps the original.
const FFMPEG_CORE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
const LOAD_TIMEOUT_MS = 30000;

let ffmpegPromise = null;

const loadFfmpeg = () => {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const [{ FFmpeg }, { toBlobURL }] = await Promise.all([import('@ffmpeg/ffmpeg'), import('@ffmpeg/util')]);
      const ffmpeg = new FFmpeg();
      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Audio converter took too long to load')), LOAD_TIMEOUT_MS);
      });
      try {
        await Promise.race([
          ffmpeg.load({
            coreURL: await toBlobURL(`${FFMPEG_CORE_URL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${FFMPEG_CORE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
          }),
          timeout,
        ]);
      } finally {
        clearTimeout(timer);
      }
      return ffmpeg;
    })().catch((err) => {
      ffmpegPromise = null; // allow another try on the next save
      throw err;
    });
  }
  return ffmpegPromise;
};

export async function convertToMp3(audio) {
  try {
    const ffmpeg = await loadFfmpeg();
    const { fetchFile } = await import('@ffmpeg/util');
    await ffmpeg.writeFile('input', await fetchFile(audio));
    const exitCode = await ffmpeg.exec(['-i', 'input', '-vn', '-ar', '44100', '-ac', '2', '-b:a', '128k', 'output.mp3']);
    if (exitCode !== 0) throw new Error(`Audio converter stopped with code ${exitCode}`);
    const data = await ffmpeg.readFile('output.mp3');
    await Promise.allSettled([ffmpeg.deleteFile('input'), ffmpeg.deleteFile('output.mp3')]);
    if (!data?.length) throw new Error('Audio converter produced an empty file');
    return new Blob([data.buffer], { type: 'audio/mpeg' });
  } catch (error) {
    console.warn('MP3 conversion failed:', error);
    return null;
  }
}
