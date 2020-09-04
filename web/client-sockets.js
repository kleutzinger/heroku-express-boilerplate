function init_socket_io() {
  socket = io.connect();

  socket.on('ping', (data) => {
    console.log(data);
  });
  socket.on('new_upload', (data) => {
    const { dl_url } = data;
    console.log(data);
    $('<a>', {
      text  : dl_url,
      title : 'Blah',
      href  : dl_url
    }).appendTo('body');
  });
}
