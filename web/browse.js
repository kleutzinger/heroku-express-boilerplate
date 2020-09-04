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

$(document).ready(function() {});
