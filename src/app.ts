import { App as BoltApp, AppOptions } from "@slack/bolt";
import {
  handleRecordChart,
  handleRecordDashboard,
  handleRecordTable,
  handleHelp,
} from "./handlers";
import { Redash } from "./redash";
import { capture } from "./capture";
import { Config } from "./config";
import { mention } from "./middleware";

export function createApp(config: Config & AppOptions) {
  const app = new BoltApp(config);

  // app.event<"app_mention">("app_mention", mention(), handleHelp);
  app.message("hello", async ({ message, say }) => {
    await say(`Hello world`);
  });
  app.message("help", mention(), handleHelp);

  for (const [host, { alias, key: apiKey }] of Object.entries(config.hosts)) {
    const redash = new Redash({ host, apiKey, alias });
    const ctx = { redash, capture };
    app.message(
      new RegExp(`${host}/queries/([0-9]+)#([0-9]+)`),
      mention(),
      handleRecordChart(ctx)
    );
    app.message(
      new RegExp(`${host}/dashboard/([^?/|>]+)`),
      mention(),
      handleRecordDashboard(ctx)
    );
    app.message(
      new RegExp(`${host}/queries/([0-9]+)#table`),
      mention(),
      handleRecordTable(ctx)
    );
  }

  return app;
}
