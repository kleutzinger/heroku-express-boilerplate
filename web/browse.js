Dropzone.options.dropzone = {
  paramName          : 'file', // The name that will be used to transfer the file
  maxFilesize        : 10, // 10 mb
  dictDefaultMessage : 'drag .slp files here<br>or click to upload', // MB
  acceptedFiles      : '.slp',
  init               : function() {
    this.on('success', function(file, resp) {
      console.log(file, resp);
      setTimeout(() => {
        this.removeFile(file);
      }, 2500);
    });
  }
};

$(document).ready(function() {
  if (window.location.href.includes('localhost:')) {
    $(document.body).css('background-color', '#add');
    $('#left_column').prepend(
      `<a href="https://spectate-melee-kb.herokuapp.com/"><h1>~go2live~</h1></a>`
    );
  }
  init_socket_io();
  fetch('/api/history', {
    method : 'get'
  })
    .then(function(response) {
      return response.json();
    })
    .then((d) => renderRows(d));
});

function renderRows(rows) {
  // https://www.ssbwiki.com/Category:Stage_icons_(SSBM) icons
  window.rows = rows; // dirty hack
  //prettier-ignore
  timeago.cancel();
  // drawMetaToScreen(rows[0].metadata);
  $('#history_list').empty();
  rows.map((history_item, idx) => {
    const p1tag = _.get(
      history_item,
      'metadata.slp_metadata.players[0].names.netplay'
    );
    const p2tag = _.get(
      history_item,
      'metadata.slp_metadata.players[1].names.netplay'
    );
    const when = _.get(history_item, 'metadata.slp_metadata.startAt');
    const { dl_url } = history_item;
    const button = `<a onClick="previewIdx(${idx})">preview</a>`;
    const time_ticker = `<p class="timeago" datetime="${when}"></p>`;
    // prettier-ignore
    const display_info = [ '\t', p1tag, 'vs', p2tag, '@', time_ticker].join(' ');
    $(
      `<div><a href="${dl_url}">download</a><span>${display_info}</span>${button}</div>`
    ).appendTo('#history_list');
    const nodes = document.querySelectorAll('.timeago');
    // use render method to render nodes in real time
    timeago.render(nodes, 'en_US', { minInterval: 3 });
  });
}

// let data_pool = {stage_id,p0_code,p1_code,p0_char,p1_char,p0_color,p1_color,last_frame,start_at,settings_tag};

function partitionRowsBySet(rows) {
  // assumes rows are sorted by start_ats
  // returns [[g0,g1], [g2,g3,g4], ... ] by set
  let row_copy = _.cloneDeep(rows);
  // allow player 1 and player 2 to switch (on reconnect?)
  const codes_str = (g) => {
    return [ g.nice.p0_code, g.nice.p1_code ].sort().join('');
  };
  const timeDelta = (t0, t1) => {
    return Math.abs(Date.parse(t0) - Date.parse(t1));
  };
  row_copy = row_copy.map((game) => {
    game.nice = niceData(game.metadata);
    game.codes_str = codes_str(game);
    console.log(codes_str(game));
    return game;
  });
  let partitions = [];
  let cur_set = [];
  _.forEachRight(row_copy, (game, idx) => {
    // go oldest to newest
    if (_.isEmpty(cur_set)) {
      cur_set.push(game);
      return true; // continue
    }
    const _last = _.last(cur_set); // newest game in the set
    if (_last.codes_str !== game.codes_str) {
      // different players, make new set
      partitions.push(cur_set);
      cur_set = [ game ];
      return true; // continue
    }
    const time_limit = 1000 * 60 * 60; // 1 hr
    const time_diff = timeDelta(_last.start_at, game.start_at);
    if (time_diff > time_limit) {
      // games more than time_limit apart
      partitions.push(cur_set);
      cur_set = [ game ];
      return true; // continue
    }

    if (time_diff < 1000 * 5) {
      //prettier-ignore
      console.log('same game? (same players, less than 5 sec apart)', _last.id, game.id);
    }
    // games are probably in the same set? (same players, similar time)
    cur_set.push(game);
  });
  if (!_.isEmpty(cur_set)) {
    partitions.push(cur_set);
  }
  return partitions;
}
