let infos = require('./infos.json');
console.log(infos.char_id_info);

// let cid = infos.char_id_info;
// for (const entry in infos.char_id_info) {
//   const char = cid[entry];
//   if (char.skin) {
//     console.log(char.skin);
//     const prefix = char.icon.split('-')[0];
//     const newskins = char.skin.map((e) => `${prefix}-${e}.png`);
//     infos.char_id_info[entry].skins = newskins;
//   }
// }

const fs = require('fs');
console.log(JSON.stringify(infos));
