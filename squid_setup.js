const { Squid } = require('@squidcloud/client');
const dotenv = require('dotenv');
dotenv.config();

const squid = new Squid({
  region: 'us-east-1.aws',
  appId: '7ex91u2djgr81nz7vj',
  apiKey: process.env['SQUID_API_KEY'],
});

module.exports = { squid };
