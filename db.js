// what to store as metadata for slippi files in database
// url
// original file name
// data type:
//    application/slippi
// long description
// date added

// tournament info to store
// creation date
// randomized name (customizable)
// bracket_urlsmash.gg url
// id

const create_str =
  '' +
  `CREATE TABLE tournament(
   id SERIAL NOT NULL PRIMARY KEY,
   name           TEXT    NOT NULL DEFAULT '',
   bracket_url    TEXT    NOT NULL DEFAULT '',
   slp_filecount INT NOT NULL DEFAULT 0,
   created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

const dotenv = require('dotenv');
dotenv.config();

const { Sequelize } = require('sequelize');

// Option 1: Passing a connection URI
const sequelize = new Sequelize(process.env.DATABASE_URL); // Example for postgres

sequelize.authenticate().then(console.log).catch((err) => console.log(err));
const { Pool, Client } = require('pg');

// const client = new Client({
//   connectionString : process.env.DATABASE_URL,
//   ssl              : {
//     rejectUnauthorized : false
//   }
// });
// client.connect();

function new_tournament(client, name = 'none', url = 'https://smash.gg') {
  const text =
    'INSERT INTO tournament(name, bracket_url) VALUES($1, $2) RETURNING *';
  const values = [ name, url ];

  client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    })
    .catch((e) => console.error(e.stack));
}

function update_tournament(client, id, key, val) {
  const text = `UPDATE tournament
        SET ${key} = '${val}'
        WHERE id = ${id}
        RETURNING *;`;
  const values = [];

  client
    .query(text, values)
    .then((res) => {
      console.log(res.rows[0]);
      // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
    })
    .catch((e) => console.error(e.stack));
}

function list_tournaments(client, callback) {
  client
    .query('SELECT * from tournament order by created_at desc;')
    .then((res) => {
      // console.log(res.rows[0]);
      callback(res.rows);
    })
    .catch((e) => console.error(e.stack));
}
// const client = new Client({
//   connectionString : process.env.DATABASE_URL,
//   ssl              : {
//     rejectUnauthorized : false
//   }
// });
// client.connect();

// new_tournament(client);
// update_tournament(client, 1, 'name', 'ponguuuuuuuuuuuus');
// list_tournaments(console.log);
// client.end();

module.exports = { list_tournaments };
