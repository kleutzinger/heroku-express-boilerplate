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

function niceData(ts) {
  // give me a timestamp obj
  // return object with useful data about the frame metadata
  data = {};
  // prettier-ignore
  let stage_id = _.get(ts, 'meta.game_state.settings.stageId');
  if (stage_id === undefined) {
    return {};
  }
  let stage_name = config.stage_id_info['' + stage_id].stage_name;
  let player_0_settings = _.get(ts, 'meta.game_state.settings.players[0]');
  let player_1_settings = _.get(ts, 'meta.game_state.settings.players[1]');

  let p0_char = player_0_settings.characterId;
  let p1_char = player_1_settings.characterId;
  let p0_stock = _.get(ts, 'meta.p1_p2_frame["0"].post.stocksRemaining');
  let p1_stock = _.get(ts, 'meta.p1_p2_frame["1"].post.stocksRemaining');

  let p0_color = _.get(
    ts,
    'meta.game_state.settings.players[0].characterColor'
  );
  let p1_color = _.get(
    ts,
    'meta.game_state.settings.players[1].characterColor'
  );
  let igt = frame_to_igt(ts.startFrame);

  let data_pool = {
    ingame_time : igt,
    stage_name  : stage_name,
    stage_id,
    p0_char,
    p1_char,
    p0_color,
    p1_color,
    p1_stock,
    p0_stock
  };
  return data_pool;
}

module.exports = { handle_slippi_file };
