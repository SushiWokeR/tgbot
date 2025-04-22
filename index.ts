import { Bot, InputFile } from 'grammy';
import { exec as execCallback } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const exec = promisify(execCallback);

// Получение токена из переменных окружения
const botToken = process.env.BOT_TOKEN;
if (!botToken) {
  throw new Error('Bot token is not defined. Please set BOT_TOKEN in your environment variables.');
}

const bot = new Bot(botToken);

// Handle the /start command.
bot.command('start', (ctx) => ctx.reply('Welcome! Use /video <link> to download video or /audio <link> to download audio.'));

// Handle /video command.
bot.command('video', async (ctx) => {
  const personalId = ctx.chat.id;
  const link = ctx.message.text?.replace('/video', '').trim();
  const videosPath = './Videos';

  if (!link) {
    await ctx.reply('Please provide a valid video link after the /video command.');
    return;
  }

  try {
    // Ensure the Videos directory exists
    await fs.mkdir(videosPath, { recursive: true });

    // Download the video using yt-dlp
    try {
      await exec(`yt-dlp -o "${videosPath}/%(title)s.%(ext)s" ${link}`);
    } catch (error) {
      await bot.api.sendMessage(personalId, `Error downloading video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Log the contents of the Videos folder
    const files = await fs.readdir(videosPath);
    console.log('Files in Videos folder:', files);

    // Find the first downloaded file
    const videoFile = files[0]; // Take the first file in the folder

    if (!videoFile) {
      await bot.api.sendMessage(personalId, 'No video file found in the Videos folder.');
      return;
    }

    const videoPath = path.join(videosPath, videoFile);

    // Send the video directly without compression
    try {
      await bot.api.sendVideo(personalId, new InputFile(videoPath));
      console.log(`Video sent: ${videoPath}`);
    } catch (sendError) {
      console.error(`Failed to send video: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`);
      await bot.api.sendMessage(personalId, `Error sending video: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`);
      return;
    }

    // Delete the video file after sending it
    try {
      await fs.unlink(videoPath);
      console.log(`Deleted video file: ${videoPath}`);
    } catch (deleteError) {
      console.error(`Failed to delete video file: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
    }
  } catch (fsError) {
    if (fsError instanceof Error) {
      await bot.api.sendMessage(personalId, `File system error: ${fsError.message}`);
    } else {
      await bot.api.sendMessage(personalId, 'An unknown error occurred.');
    }
  }
});

// Handle /audio command.
bot.command('audio', async (ctx) => {
  const personalId = ctx.chat.id;
  const link = ctx.message.text?.replace('/audio', '').trim();
  const audiosPath = './Audios';

  if (!link) {
    await ctx.reply('Please provide a valid video link after the /audio command.');
    return;
  }

  try {
    // Ensure the Audios directory exists
    await fs.mkdir(audiosPath, { recursive: true });

    // Download the audio using yt-dlp
    try {
      await exec(`yt-dlp -x --audio-format mp3 -o "${audiosPath}/%(title)s.%(ext)s" ${link}`);
    } catch (error) {
      await bot.api.sendMessage(personalId, `Error downloading audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }

    // Log the contents of the Audios folder
    const files = await fs.readdir(audiosPath);
    console.log('Files in Audios folder:', files);

    // Find the first downloaded file
    const audioFile = files[0]; // Take the first file in the folder

    if (!audioFile) {
      await bot.api.sendMessage(personalId, 'No audio file found in the Audios folder.');
      return;
    }

    const audioPath = path.join(audiosPath, audioFile);

    // Send the audio file
    try {
      await bot.api.sendAudio(personalId, new InputFile(audioPath));
      console.log(`Audio sent: ${audioPath}`);
    } catch (sendError) {
      console.error(`Failed to send audio: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`);
      await bot.api.sendMessage(personalId, `Error sending audio: ${sendError instanceof Error ? sendError.message : 'Unknown error'}`);
      return;
    }

    // Delete the audio file after sending it
    try {
      await fs.unlink(audioPath);
      console.log(`Deleted audio file: ${audioPath}`);
    } catch (deleteError) {
      console.error(`Failed to delete audio file: ${deleteError instanceof Error ? deleteError.message : 'Unknown error'}`);
    }
  } catch (fsError) {
    if (fsError instanceof Error) {
      await bot.api.sendMessage(personalId, `File system error: ${fsError.message}`);
    } else {
      await bot.api.sendMessage(personalId, 'An unknown error occurred.');
    }
  }
});

// Start the bot.
bot.start();
