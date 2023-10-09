import TelegramBot from "node-telegram-bot-api";
import http from "http";
import OpenAI from "openai";

const telegram_token = process.env.BOT_TOKEN;
const openai_token = process.env.OPENAI_TOKEN;

if (!telegram_token || !openai_token) {
  throw new Error("telegram/openai token not set");
}

const bot = new TelegramBot(telegram_token, { polling: true });
let lastId: number | undefined;

const openai = new OpenAI({
  apiKey: openai_token,
});

const server = http.createServer((req, res) => {
  switch (req.method) {
    case "GET":
      res.statusCode = 200;
      res.end();
      return;

    case "POST":
      let body = "";
      req
        .on("data", (chunk) => {
          body += chunk;
        })
        .on("end", async () => {
          const chat = await openai.chat.completions.create({
            messages: [
              {
                role: "user",
                content: `你是一位精通日语的翻译，请将这段日语文字翻译为中文：\n${body}`,
              },
            ],
            model: "gpt-3.5-turbo",
          });

          const text = chat.choices[0].message.content;
          if (!text) {
            throw new Error("no text returned");
          }

          console.log(JSON.stringify(chat.choices[0]));

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
        })
        .on("error", (err: any) => {
          console.log(err);
          return;
        });
      break;
    default:
      res.statusCode = 400;
      res.end();
      break;
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "hello world!");
});

bot.onText(/\/start/, (msg) => {
  lastId = msg.chat.id;

  if (!server.listening) {
    server.listen(process.env.PORT, () => {
      console.log(`Server running at port: ${process.env.PORT}`);
    });
  }
});

bot.onText(/\/stop/, (_msg) => {
  lastId = undefined;
  if (server.listening) {
    server.close();
  }
});
