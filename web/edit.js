// we have timestamp obj

const editableFields = [ 'startFrame', 'endFrame', 'desc' ];

function saveAll(timestamp) {}

function sendPostRequest(send_timestamp) {
  $.ajax({
    url         : '/api/update',
    type        : 'POST',
    contentType : 'application/json',
    data        : JSON.stringify({ timestamp: send_timestamp }),
    success     : function(response) {
      console.log(response);
    }
  });
}
function createHtml(timestamp) {
  let $inps = editableFields.map((field) => {});
}

function populateHtml() {
  for (let field of editableFields) {
    let display_val;
    if (field === 'desc') {
      display_val = _.get(given_timestamp, 'meta.desc');
    } else {
      display_val = _.get(given_timestamp, field);
    }

    console.log(field, display_val);
    $(`#${field}`).val(display_val);
    // $(`#${field}`).text(_.get(given_timestamp, field));
  }
}

function uploadForms() {
  let to_send = _.cloneDeep(given_timestamp); // default to given values

  for (let field of editableFields) {
    let onpage_val = $(`#${field}`).val();
    console.log(onpage_val);
    let obj_key = field;
    if (field === 'desc') {
      obj_key = 'meta.desc';
    }
    if (field.includes('Frame')) {
      onpage_val = parseInt(onpage_val);
    }
    console.log(obj_key, onpage_val);
    _.set(to_send, obj_key, onpage_val);
  }
  sendPostRequest(to_send);
}

$(document).ready(() => {
  if (given_timestamp) {
    populateHtml();
  }
});
