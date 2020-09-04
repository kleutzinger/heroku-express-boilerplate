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
      data.map((history_item) => {
        const { dl_url } = history_item;
        $(`<div><a href="${dl_url}">${dl_url}</a></div>`).appendTo(
          '#history_list'
        );
      });
    });
});
