const dotenv = require('dotenv');
dotenv.config();

const _ = require('lodash');
const { new_metadata } = require('./api.js');

function getSlippiData(path) {
  const { default: SlippiGame } = require('@slippi/slippi-js');
  const game = new SlippiGame(path);
  // Get game settings – stage, characters, etc
  const slp_settings = game.getSettings();
  // Get metadata - start time, platform played on, etc
  const slp_metadata = game.getMetadata();

  return { slp_settings, slp_metadata };
}

async function handle_slippi_file(path) {
  try {
    const filename = path.split('/').pop();
    const metadata = getSlippiData(path);
    const resp = await new_metadata(filename, metadata);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { handle_slippi_file };
