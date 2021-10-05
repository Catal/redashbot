import { App, ExpressReceiver } from "@slack/bolt";
import { createApp } from "./src/app";
import { config } from "./src/config";

const receiver = new ExpressReceiver({
  signingSecret: config.signingSecret,
});

const app = createApp({ ...config, receiver });

receiver.router.get("/", (_, res) => {
  console.log(process.env.SLACK_BOT_TOKEN!);
  app.client.chat.postMessage({ text: "test", channel: "#test_bot" });
  res.send("ok");
});
(async () => {
  // Start your app
  await app.start(config.port);
  console.log(`⚡️ Bolt app is running @ ${config.port}!`);
})();
