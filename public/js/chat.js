
var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');
  var params = jQuery.deparam(window.location.search);

  socket.emit('join', params, function (err) {
    if (err) {
      alert(err);
      window.location.href = '/';
    } else {
      console.log('No error');
    }
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('updateUserList', function (users) {
  $("#users").empty();
  users.forEach(function (user) {
    var li = jQuery('<li class="person" data-chat="person1"><div class="user"><img src="https://www.bootdey.com/img/Content/avatar/avatar1.png" alt="Retail Admin"><span class="status busy"></span></div><p class="name-time"><span class="name">'+user+'</span><span class="time">15/02/2019</span></p></li>');
    jQuery('#users').append(li);
  });

});

socket.on('newMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = jQuery('<li class="chat-left"><div class="chat-avatar"><img src="https://www.bootdey.com/img/Content/avatar/avatar1.png" alt="Retail Admin"><div class="chat-name">'+message.from+'</div></div><div class="chat-text">'+message.text+'</div><div class="chat-hour">'+formattedTime+' <span class="fa fa-check-circle"></span></div></li>');
  jQuery('#messages').append(li);
});

socket.on('newLocationMessage', function (message) {
  var formattedTime = moment(message.createdAt).format('h:mm a');
  var li = jQuery('<li class="chat-left"><div class="chat-avatar"><img src="https://www.bootdey.com/img/Content/avatar/avatar1.png" alt="Retail Admin"><div class="chat-name">'+message.from+'</div></div><div class="chat-text"><a href="'+message.url+'" target="_blank">Current Location</a></div><div class="chat-hour">'+formattedTime+' <span class="fa fa-check-circle"></span></div></li>');
  jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function (e) {
  e.preventDefault();
  var formattedTime = moment(moment().valueOf()).format('h:mm a');
  var message =  jQuery('[name=message]').val();
  var li = jQuery('<li class="chat-right"><div class="chat-hour">'+formattedTime+' <span class="fa fa-check-circle"></span></div><div class="chat-text">'+message+'</div><div class="chat-avatar"><img src="https://www.bootdey.com/img/Content/avatar/avatar1.png" alt="Retail Admin"><div class="chat-name">Me</div></div></li>');
  // li.text(`${message.from}: ${message.text}`);
  
  jQuery('#messages').append(li);
  socket.emit('createMessage', {
    from: 'User',
    text: jQuery('[name=message]').val()
  }, function () {
  });
  jQuery('[name=message]').val(' ')
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
  if (!navigator.geolocation) {
    return alert('Geolocation not supported by your browser.');
  }

  navigator.geolocation.getCurrentPosition(function (position) {

    var formattedTime = moment(moment().valueOf()).format('h:mm a');
    var li = jQuery('<li class="chat-right"><div class="chat-hour">'+formattedTime+' <span class="fa fa-check-circle"></span></div><div class="chat-text"><a href="https://www.google.com/maps?q='+position.coords.latitude+','+position.coords.longitude+'" target="_blank">My Location</a></div><div class="chat-avatar"><img src="https://www.bootdey.com/img/Content/avatar/avatar1.png" alt="Retail Admin"><div class="chat-name">Me</div></div></li>');

    jQuery('#messages').append(li);
      socket.emit('createLocationMessage', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    }, function () {
      alert('Unable to fetch location.');
    });
});
