require('dotenv').config();

const { App } = require('@slack/bolt');
const { default: axios } = require('axios');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_OAUTH_TOKEN,
  customRoutes: [
    {
      path: '/',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end('<h1>Easy Hours Bot is working!</h1>');
      },
    },
  ],
});

app.message(':robot_face:', async ({ message, say }) => {
  await say(`Beep Boop!: <@${message.user}>`);
});

(async () => {
  await app.start(process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000);
  console.log(`Bolt app is running in port ${Number.parseInt(process.env.PORT)}!`);
})();
