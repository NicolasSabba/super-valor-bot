require('dotenv').config();

const { App } = require('@slack/bolt');
const { default: axios } = require('axios');
const moment = require('moment');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
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

