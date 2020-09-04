Dropzone.options.dropzone = {
  paramName          : 'file', // The name that will be used to transfer the file
  maxFilesize        : 10, // 10 mb
  dictDefaultMessage : 'drag .slp files here<br>or click to upload', // MB
  init               : function() {
    this.on('success', function(file, resp) {
      console.log(file, resp);
      this.removeFile(file);
    });
  }
};

$(document).ready(function() {
  init_socket_io();
  fetch('/api/history', {
    method : 'get'
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      console.log(data);
      //prettier-ignore
      data.map((history_item) => {
        const p1tag = _.get(history_item, 'metadata.slp_metadata.players[0].names.netplay');
        const p2tag = _.get(history_item, 'metadata.slp_metadata.players[1].names.netplay');
        const when = _.get(history_item, 'metadata.slp_metadata.startAt');
        const { dl_url } = history_item;
        const display_info = ['\t', p1tag, 'vs', p2tag, '@', new Date(when).toLocaleString()].join(' ')
        $(`<div><a href="${dl_url}">${dl_url}</a><span>${display_info}</span></div>`).appendTo(
          '#history_list'
        );
      });
    });
});
