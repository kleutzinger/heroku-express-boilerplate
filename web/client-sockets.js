function init_socket_io() {
  socket = io.connect();
  // socket.on('ping', (data) => {
  //   console.log(data);
  // });
  socket.on('new_upload', (data) => {
    const { dl_url } = data;
    console.log(dl_url);
    $(`<div><a href="${dl_url}">${dl_url}</a></div>`).prependTo(
      '#history_list'
    );
  });
}
