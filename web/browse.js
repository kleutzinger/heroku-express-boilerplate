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
    .then((rows) => {
      // renderRows(d);
      const global_sets = partitionRowsBySet(rows);
      populateTable(global_sets);
      console.log(global_sets);
    });
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
    const button = `<a onClick="previewIdx(${idx})">generate thumbnail</a>`;
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
