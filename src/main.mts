import dotenv from "dotenv";
import { Scenes, session, Telegraf } from "telegraf";
import { busy } from "./commands/busy.mjs";
import { free } from "./commands/free.mjs";
import { games } from "./commands/games.mjs";
import { plan } from "./commands/plan.mjs";
import { settings } from "./commands/settings.mjs";
import { start } from "./commands/start.mjs";
import DB from "./db.mjs";
import { BotContext } from "./types/bot-context.mjs";

dotenv.config();

if (!process.env.BOT_TOKEN) throw new Error("No token");

/** @todo ID */
const scene = new Scenes.BaseScene<Scenes.SceneContext>("id");
scene.on("sticker", async (ctx) => await ctx.reply("👍"));
scene.command("exit", async (ctx) => await ctx.scene.leave());

const scene2 = new Scenes.BaseScene<Scenes.SceneContext>("id");
scene2.on("sticker", async (ctx) => await ctx.reply("👍"));
scene2.command("exit", async (ctx) => await ctx.scene.leave());


const stage = new Scenes.Stage<Scenes.SceneContext>([scene, scene2]);

const bot = new Telegraf<Scenes.SceneContext>(process.env.BOT_TOKEN);
const db = new DB();

// const createCommands = () => {
//   start(bot);
//   plan(bot);
//   free(bot);
//   busy(bot);
//   games(bot);
//   settings(bot);
// };

db.init().then(() => {
  // createCommands();
  bot.use(session());
  bot.use(stage.middleware());
  bot.command("start", async (ctx) => await ctx.scene.enter("id"));

  bot.launch().catch((e) => console.error(e));
  console.log("Bot launched");

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
});
