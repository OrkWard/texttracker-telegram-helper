import TelegramBot from "node-telegram-bot-api";
import http from "http";
import OpenAI from "openai";

const telegram_token = process.env.BOT_TOKEN;
const openai_token = process.env.OPENAI_TOKEN;

if (!telegram_token || !openai_token) {
  throw new Error('telegram/openai token not set');
}

const bot = new TelegramBot(telegram_token, { polling: true });
let lastId: number | undefined;

const openai = new OpenAI({
  apiKey: openai_token,
});

const server = http.createServer(async (req, res) => {
  switch (req.method) {
    case "GET":
      res.statusCode = 200;
      res.end();
      return;

    case "POST":
      try {
        const chat = await openai.chat.completions.create({
          messages: [{ role: "user", content: "hi" }],
          model: "gpt-3.5-turbo",
        });

        console.log(chat.choices);

        const text = chat.choices[0].message.content;
        if (!text) {
          throw new Error("no text returned");
        }

        // send message
        if (lastId) {
          bot.sendMessage(lastId, text);
        }

        // write response
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain");
        res.write(text);
        res.end();
        return;
      } catch (err: any) {
        console.log(err);
        break;
      }

    default:
      break;
  }

  res.statusCode = 400;
  res.end();
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "hello world!");
});

bot.onText(/\/start/, (msg) => {
  lastId = msg.chat.id;

  if (!server.listening) {
    server.listen(8999, "localhost", () => {
      console.log("Server running at localhost:8999");
    });
  }
});

bot.onText(/\/stop/, (_msg) => {
  lastId = undefined;
  if (server.listening) {
    server.close();
  }
});
