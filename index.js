"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new grammy_1.Bot(''); // <-- put your bot token between the ""
// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.
// Handle the /start command.
bot.command('start', (ctx) => ctx.reply('Welcome! Up and running.'));
// Handle other messages.
bot.on('message', (ctx) => {
    const personalId = ctx.chat.id;
    const link = ctx.message.text;
    const videosPath = './Videos';
    fs_1.default.rmSync(videosPath, { recursive: true });
    (0, child_process_1.exec)(`yt-dlp ${link}`, (error, stdout, stderr) => {
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
        bot.api.sendVideo(personalId, new grammy_1.InputFile(videosPath + '/' + fs_1.default.readdirSync(videosPath)[0]));
    });
});
// Start the bot.
bot.start();
