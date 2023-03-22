import { Bot, InputFile } from 'grammy';
import { exec } from 'child_process';
import fs from 'fs';

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot(''); // <-- put your bot token between the ""
// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'));
// Handle other messages.
bot.on('message', (ctx) => {
  const personalId = ctx.chat.id;
  const link = ctx.message.text;
  const videosPath: string = './Videos';

  fs.rmSync(videosPath, { recursive: true });

  exec(`yt-dlp ${link}`, (error, stdout, stderr) => {
    if (error) {
      bot.api.sendMessage(personalId, `error: ${error.message}`);
      return;
    }
    if (stderr) {
      bot.api.sendMessage(personalId, `error: ${stderr}`);
      return;
    }

    // bot.api.sendMessage(ctx.chat.id, `stdout: ${stdout}`);
    // exec(`ffmpeg -i ./Videos/${allVideos[0]} -c:v mpeg4 ./Videos/${allVideos[0]}`);
    bot.api.sendVideo(personalId, new InputFile(videosPath + '/' + fs.readdirSync(videosPath)[0]));
  });
});

// Start the bot.
bot.start();
