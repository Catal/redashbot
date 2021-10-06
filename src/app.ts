import {
  App as BoltApp,
  AppOptions,
  Middleware,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
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

  function handleText(
    r: RegExp
  ): Middleware<SlackEventMiddlewareArgs<"message">> {
    return async ({ message, next, context }) => {
      const text: string = (message as any)?.text;

      if (!text) {
        console.log("no text: ", message);
        return;
      }
      const m = r.exec(text);
      if (!m) {
        return;
      }
      context.matches = m;
      await next!();
    };
  }

  app.message("help", mention(), handleHelp);

  for (const [host, { alias, key: apiKey }] of Object.entries(config.hosts)) {
    const redash = new Redash({ host, apiKey, alias });
    const ctx = { redash, capture };
    app.event(
      "message",
      handleText(new RegExp(`${host}/queries/([0-9]+)#([0-9]+)`)),
      handleRecordChart(ctx)
    );
    app.event(
      "message",
      handleText(new RegExp(`${host}/queries/([0-9]+)/source#([0-9]+)`)),
      handleRecordChart(ctx)
    );
    app.event(
      "message",
      handleText(new RegExp(`${host}/dashboard/([^?/|>]+)`)),
      handleRecordDashboard(ctx)
    );
    app.event(
      "message",
      handleText(new RegExp(`${host}/queries/([0-9]+)#table`)),
      handleRecordTable(ctx)
    );
    // app.message(
    //   new RegExp(`${host}/queries/([0-9]+)#([0-9]+)`),
    //   mention(),
    //   handleRecordChart(ctx)
    // );
    // app.message(
    //   new RegExp(`${host}/dashboard/([^?/|>]+)`),
    //   mention(),
    //   handleRecordDashboard(ctx)
    // );
    // app.message(
    //   new RegExp(`${host}/queries/([0-9]+)#table`),
    //   mention(),
    //   handleRecordTable(ctx)
    // );
  }

  return app;
}
