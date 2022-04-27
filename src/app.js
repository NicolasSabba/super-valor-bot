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
    if (event.user === event.item_user) { return; }
    let srcUser = await app.client.users.info({ user: event.user });
    let dstUser = await app.client.users.info({ user: event.item_user });
    value = event.reaction.slice(4);
    try {
      const _res = await axios.post(
        `${process.env.VALUE_URL}/delivered`,
        {
          value,
          to: [dstUser.user.profile.email],
          type: "value",
          from: srcUser.user.profile.email,
          actions: `For your interactions in "Slack" (from Easy Values bot)`,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.VALUE_AUTH,
          },
        }
      );
      console.log(
        `${srcUser.user.profile.email} le envió un valor de ${value} a ${dstUser.user.profile.email}`
      );
      const _result = await app.client.chat.postEphemeral({
        channel: event.item.channel,
        user: srcUser.user.id,
        text: `${value.toUpperCase()} value for ${dstUser.user.profile.real_name_normalized} sent successfully!`
      });
    } catch (err) {
      console.error(err);
      console.error(
        `No se pudo enviar el valor ${value} de ${srcUser.user.profile.email} a ${dstUser.user.profile.email}`
      );
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
