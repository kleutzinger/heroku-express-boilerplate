const { Pool } = require('pg');
var config = {
  connectionString: process.env.DOKKU_POSTGRES_AQUA_URL,
  ssl: process.env.DOKKU_POSTGRES_AQUA_URL.includes('localhost')
    ? false
    : {
        rejectUnauthorized: false,
      },
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 2000,
};
var pool = new Pool(config);

module.exports = pool;

// const tournament = `
//    CREATE TABLE tournament(
//    id SERIAL NOT NULL PRIMARY KEY,
//    name           TEXT    NOT NULL DEFAULT '',
//    bracket_url    TEXT    NOT NULL DEFAULT '',
//    slp_filecount INT NOT NULL DEFAULT 0,
//    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
// `;

// const upload_history = `
//   CREATE TABLE upload_history(
//   id         SERIAL  NOT NULL PRIMARY KEY,
//   dl_url     TEXT    NOT NULL DEFAULT '',
//   is_temp    BOOLEAN NOT NULL DEFAULT FALSE,
//   settings_id TEXT    NOT NULL DEFAULT '',
//   file_size       INT     NOT NULL DEFAULT 0,
//   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
// );
// `;

const slp_history = `
  CREATE TABLE slp_history(
  id         SERIAL  NOT NULL PRIMARY KEY,
  hosted_filename   TEXT    NOT NULL DEFAULT '',
  dl_url     TEXT    NOT NULL DEFAULT '',
  is_temp    BOOLEAN NOT NULL DEFAULT FALSE,
  uniq_tag   TEXT    NOT NULL DEFAULT '',
  filesize       INT     NOT NULL DEFAULT 0,
  metadata   jsonb   not null default '{}'::jsonb,
  start_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (uniq_tag)
);
`;

// const slippi_meta = `
//   CREATE TABLE slippi_meta(
//   id         SERIAL NOT NULL PRIMARY KEY,
//   file_id    text    NOT NULL DEFAULT '',
//   file_size       INT     NOT NULL DEFAULT 0,
//   metadata   jsonb   not null default '{}'::jsonb
//   );
// `;

// select SUBSTRING(filename, length(filename)-23) from upload_history;
// Nn6pFd2-Game_20200810T180947.slp -> Game_20200810T180947.slp

// SELECT ('2012-08-04 00:19:35'::TIMESTAMP - '2012-08-04 00:19:33'::TIMESTAMP) between '-1s'::interval and '1s'::interval;

const between_times_text = ` 
-- goal: get all timestamps between time0 and time1 ?
-- where $[minus_time, plus_time]
SELECT id, start_at, settings_tag from slp_history
where (
  start_at >= $1::timestamp
  AND
  start_at <= $2::timestamp
  );
`;
