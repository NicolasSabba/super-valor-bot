require("dotenv").config();

const { App } = require("@slack/bolt");
const { default: axios } = require("axios");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_OAUTH_TOKEN,
  customRoutes: [
    {
      path: "/",
      method: ["GET"],
      handler: (req, res) => {
        res.writeHead(200);
        res.end("<h1>Easy Hours Bot is working!</h1>");
      },
    },
  ],
});

app.message(":robot_face:", async ({ message, say }) => {
  await say(`Beep Boop!: <@${message.user}>`);
});

app.event("reaction_added", async ({ event }) => {
  if (
    ["ico-participation", "ico-trust", "ico-passion", "ico-courage"].find(
      (element) => element === event.reaction
    )
  ) {
    let srcUser = await app.client.users.info({ user: event.user });
    let dstUser = await app.client.users.info({ user: event.item_user });
    value = event.reaction.slice(4);
    try {
      const res = await axios.post(
        `${process.env.VALUE_URL}/delivered`,
        {
          value,
          to: [
            dstUser.user.profile.email,
          ],
          type: "value",
          from: srcUser.user.profile.email,
          actions: `${value} (from Easy value)`,
        }
      );
      console.log(res.data);
      console.log(`${srcUser.user.profile.email} le envió un valor de ${value} a ${dstUser.user.profile.email}`);
    } catch (err) {
      console.error(err);
      console.error(`No se pudo enviar el valor ${value} de ${srcUser.user.profile.email} a ${dstUser.user.profile.email}`);
    }
  }
  return;
});

(async () => {
  await app.start(
    process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000
  );
  console.log(
    `Bolt app is running in port ${Number.parseInt(process.env.PORT)}!`
  );
})();
