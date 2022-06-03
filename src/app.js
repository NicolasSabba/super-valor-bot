require("dotenv").config();

const { App } = require("@slack/bolt");
const { default: axios } = require("axios");
const { VALUE_MESSAGE, VALUES } = require("./consts");

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_OAUTH_TOKEN,
  customRoutes: [
    {
      path: "/",
      method: ["GET"],
      handler: (_req, res) => {
        res.writeHead(200);
        res.end("<h1>Easy Hours Bot is working!</h1>");
      },
    },
  ],
});

// Si tenemos un objeto como DB
// TODO: Cambiar a redis
let DB = {};

app.message(":robot_face:", async ({ message, say }) => {
  await say(`Beep Boop!: <@${message.user}>`);
});

app.event("reaction_added", async ({ event }) => {
  let value = VALUES[event.reaction];
  if (value !== undefined) {
    // Si se quiere enviar un valor a el mismo
    if (event.user === event.item_user) {
      return;
    }
    // Creamos la key de la DB
    // {targetId, fecha}
    const DBKey = event.user + event.item.channel;
    if (
      DB[DBKey]?.targetID === event.item_user &&
      Date.now() - DB[DBKey]?.fecha < 10000
    ) {
      return;
    }
    // Lockear el envio del usuario
    DB[DBKey] = {
      targetID: event.item_user,
      fecha: Date.now(),
    };
    try {
      let srcUser = await app.client.users.info({ user: event.user });
      let dstUser = await app.client.users.info({ user: event.item_user });
      const _res = await axios.post(
        `${process.env.VALUE_URL}/delivered`,
        {
          value,
          to: [dstUser.user.profile.email],
          type: "value",
          from: srcUser.user.profile.email,
          actions: VALUE_MESSAGE,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: process.env.VALUE_AUTH,
          },
        }
      );
      console.info(
        `${srcUser.user.profile.email} le envió un valor de ${value} a ${dstUser.user.profile.email}`
      );
    } catch (err) {
      console.error(
        `No se pudo enviar el valor ${value} de ${srcUser.user.profile.email} a ${dstUser.user.profile.email}`,
        err
      );
    }
    try {
      const _result = await app.client.chat.postEphemeral({
        channel: event.item.channel,
        user: srcUser.user.id,
        text: `${value.toUpperCase()} value for ${
          dstUser.user.profile.real_name_normalized
        } sent successfully!`,
      });
    } catch (err) {
      console.error("No se pudo publicar el mensaje efimero", err);
      // Se limpia la key de la DB
      DB[DBKey] = null;
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
