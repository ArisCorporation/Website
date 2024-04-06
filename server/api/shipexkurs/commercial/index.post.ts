import { createDirectus, rest, uploadFiles, authentication, updateItem } from '@directus/sdk';
import fs from 'node:fs';
import ytdl from 'ytdl-core';
import cp from 'child_process';
import ffmpeg from 'ffmpeg-static';
const videoId = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

const config = useRuntimeConfig();

// const client = createDirectus(config.public.backendUrl).with(rest());

// const title = 'Carrack Commercial';
// const file = new Blob([readFileSync('~/server/api/commercial/temp/video.mp4')], { type: 'video/mp4' });
// const fileName = 'Carrack_Commercial.mp4';

// const formData = new FormData();
// formData.append('title', title);
// formData.append('file', file, fileName);

async function downloadVideo(video_id: string, ship_id: string) {
  // let outputFileName = '';
  // let outputFilePath = '';

  // const audio = ytdl(video_id, { filter: 'audioonly', quality: 'highestaudio' });
  // const video = ytdl(video_id, { filter: 'videoonly', quality: 'highestvideo' });

  const outputFileName = await ytdl.getInfo(video_id).then((info) => info.videoDetails.title);

  // console.log(outputFileName);
  // const ffmpegProcess = cp.spawn(
  //   ffmpeg,
  //   [
  //     // Remove ffmpeg's console spamming
  //     '-loglevel',
  //     '0',
  //     '-hide_banner',
  //     // 3 second audio offset
  //     '-itsoffset',
  //     '3.0',
  //     '-i',
  //     'pipe:3',
  //     '-i',
  //     'pipe:4',
  //     // Rescale the video
  //     // '-vf',
  //     // 'scale=320:240',
  //     // Choose some fancy codes
  //     '-c:v',
  //     'libx265',
  //     '-x265-params',
  //     'log-level=0',
  //     '-c:a',
  //     'flac',
  //     // Define output container
  //     '-f',
  //     'matroska',
  //     // 'webm',
  //     'pipe:5',
  //   ],
  //   {
  //     windowsHide: true,
  //     stdio: [
  //       /* Standard: stdin, stdout, stderr */
  //       'inherit',
  //       'inherit',
  //       'inherit',
  //       /* Custom: pipe:3, pipe:4, pipe:5 */
  //       'pipe',
  //       'pipe',
  //       'pipe',
  //     ],
  //   },
  // );
  // ffmpegProcess.on('close', () => {
  //   process.stdout.write('\n\n\n');
  //   // clearInterval(progressbar);
  //   console.log('done');
  // });

  // // Link streams
  // // FFmpeg creates the transformer streams and we just have to insert / read data
  // audio.pipe(ffmpegProcess.stdio[3]);
  // video.pipe(ffmpegProcess.stdio[4]);
  // ffmpegProcess.stdio[5].pipe(fs.createWriteStream(outputFilePath || 'test' + '.mkv'));
  // // ffmpegProcess.stdio[5].pipe(fs.createWriteStream('./out.mkv'));

  // // const video = await ytdl.getInfo(video_id).then(async (info) => {
  // //   // Select the video format and quality
  // //   const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'videoandaudio' });
  // //   // Create a write stream to save the video file
  // //   const outputFileName = `${info.videoDetails.title}.${format.container}`;
  // //   const outputFilePath = './' + outputFileName;
  // //   // const outputFilePath = './server/api/shipexkurs/commercial/temp/' + outputFileName;
  // //   console.log(`Starting downloading: ${outputFilePath}`);
  // //   const outputStream = fs.createWriteStream(outputFilePath);
  // //   // Download the video file
  // //   ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
  // //   // When the download is complete, show a message
  // //   await outputStream.on('finish', async () => {
  // //     console.log(`Finished downloading: ${outputFilePath}`);
  // //     console.log(format.mimeType?.split(';')[0]);
  // //     const uploadedFile = await uploadVideo(outputFileName, outputFilePath, format.mimeType.split(';')[0], ship_id);
  // //     return uploadedFile;
  // //   });
  // // });

  const audio = ytdl(video_id, { quality: 'highestaudio' });
  const video = ytdl(video_id, { quality: 'highestvideo' });

  // Prepare the progress bar
  // let progressbarHandle = null;
  // const progressbarInterval = 1000;
  // const showProgress = () => {
  //   readline.cursorTo(process.stdout, 0);
  //   const toMB = i => (i / 1024 / 1024).toFixed(2);

  //   process.stdout.write(`Audio  | ${(tracker.audio.downloaded / tracker.audio.total * 100).toFixed(2)}% processed `);
  //   process.stdout.write(`(${toMB(tracker.audio.downloaded)}MB of ${toMB(tracker.audio.total)}MB).${' '.repeat(10)}\n`);

  //   process.stdout.write(`Video  | ${(tracker.video.downloaded / tracker.video.total * 100).toFixed(2)}% processed `);
  //   process.stdout.write(`(${toMB(tracker.video.downloaded)}MB of ${toMB(tracker.video.total)}MB).${' '.repeat(10)}\n`);

  //   process.stdout.write(`Merged | processing frame ${tracker.merged.frame} `);
  //   process.stdout.write(`(at ${tracker.merged.fps} fps => ${tracker.merged.speed}).${' '.repeat(10)}\n`);

  //   process.stdout.write(`running for: ${((Date.now() - tracker.start) / 1000 / 60).toFixed(2)} Minutes.`);
  //   readline.moveCursor(process.stdout, 0, -3);
  // };

  // Start the ffmpeg child process
  const ffmpegProcess = cp.spawn(
    ffmpeg,
    [
      // Remove ffmpeg's console spamming
      '-loglevel',
      '8',
      '-hide_banner',
      // Redirect/Enable progress messages
      '-progress',
      'pipe:3',
      // Set inputs
      '-i',
      'pipe:4',
      '-i',
      'pipe:5',
      // Map audio & video from streams
      '-map',
      '0:a',
      '-map',
      '1:v',
      // Keep encoding
      '-c:v',
      'copy',
      // Define output file
      outputFileName + '.webm',
    ],
    {
      windowsHide: true,
      stdio: [
        /* Standard: stdin, stdout, stderr */
        'inherit',
        'inherit',
        'inherit',
        /* Custom: pipe:3, pipe:4, pipe:5 */
        'pipe',
        'pipe',
        'pipe',
      ],
    },
  );
  ffmpegProcess.on('close', () => {
    console.log('Finished video processing!');
    // Cleanup
    // process.stdout.write('\n\n\n\n');
    // clearInterval(progressbarHandle);
  });

  // Link streams
  // FFmpeg creates the transformer streams and we just have to insert / read data
  ffmpegProcess.stdio[3].on('data', (chunk: any) => {
    // Start the progress bar
    // if (!progressbarHandle) progressbarHandle = setInterval(showProgress, progressbarInterval);
    // Parse the param=value list returned by ffmpeg
    const lines = chunk.toString().trim().split('\n');
    const args = {};
    for (const l of lines) {
      const [key, value] = l.split('=');
      args[key.trim()] = value.trim();
    }
    // tracker.merged = args;
  });
  audio.pipe(ffmpegProcess.stdio[4]);
  video.pipe(ffmpegProcess.stdio[5]);

  await uploadVideo(outputFileName, ship_id);
}

async function uploadVideo(file_name: string, ship_id: string) {
  try {
    const file_path = file_name + '.webm';
    const client = createDirectus('http://10.1.1.7:8055').with(authentication()).with(rest());
    await client.setToken('-_XrBWIxuJyxZ-WhHgIFZAZs_7pxA0MY');
    // const formData = new FormData();
    // formData.append('file_1_property', 'Value');
    // formData.append('file', file_path);

    // const result = await client.request(uploadFiles(formData));

    // return result;
    const title = file_name.split('.')[0];
    const file = new Blob([fs.readFileSync(file_path)], { type: 'video/webm' });
    // const file = new Blob([fs.readFileSync(String(file_path))]);
    console.log(file_path);
    const fileName = file_name;

    const formData = new FormData();
    formData.append('title', title);
    formData.append('folder', 'e58852eb-657f-463c-ba8d-48d5f7b1e9e0');
    formData.append('file', file, fileName);

    const result = await client.request(uploadFiles(formData));

    console.log('Upload finished!');
    // console.log(result.id);
    // console.log(result.id);

    if (result) {
      await fs.unlink(file_path, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log('File is deleted.');
        }
      });
    }

    await client.request(updateItem('ships', ship_id, { commercial: String(result.id) }));
    console.log('Ship Updated!');

    return;
  } catch (error) {
    console.error('Error:', error);
  }
}

export default defineEventHandler(async (event) => {
  // Get body and video id
  const body = await readBody(event);
  const { video_id, ship_id } = body;

  await downloadVideo(video_id, ship_id);
  return 'Loading...';
  // try {
  //   await ytdl('http://www.youtube.com/watch?v=dQw4w9WgXcQ').pipe(createWriteStream('video2.mp4'));
  //   // const result = await client.request(uploadFiles(formData));
  //   // return result;
  //   return 'd';
  // } catch (error) {
  //   console.error('Error:', error);
  // }
});
