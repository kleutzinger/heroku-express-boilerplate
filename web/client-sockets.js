function init_socket_io() {
  socket = io.connect();

  socket.on('ping', (data) => {
    console.log(data);
  });
  socket.on('new_upload', (data) => {
    console.log(data);
  });
}
