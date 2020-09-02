$('#launchargs1598404092018').text('hi');
console.log($('select'));

$(document).ready(function() {
  $('#launchargs1598404092018').val('hi');
  console.log($('select'));

  var newOptions = {
    ts           : 'FrameStart',
    'From Start' : 'start',
    other        : 'other'
  };

  var $el = $('#launchargs1598404092018');
  $el.empty(); // remove old options
  $.each(newOptions, function(key, value) {
    $el.append($('<option></option>').attr('value', value).text(key));
  });
});
