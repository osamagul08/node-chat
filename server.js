const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http')
const socketIo = require('socket.io')

dotenv.config({path:'./config.env'});
const {isRealString} = require('./utils/validation');
const {generateMessage, locationLink} = require('./utils/generateMessage')
const app = require('./app')
const {Users} = require('./utils/users');
const users = new Users();



const DB = process.env.DATABASE.replace('<password>', process.env.DATABASE_PASSWORD)
mongoose.connect(DB, {
  // useNewUrlParser: true,
  // useCreateIndex: true,
  // useFindAndModify:false
}).then(()=>console.log("database connected"))

var server = http.createServer(app);
var io = socketIo(server)
io.on('connection', (socket) => {
  console.log('New user connected');
 
  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.roomname)) {
      callback('Name and room name are required.');
    }
    socket.join(params.roomname);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.roomname);
    io.to(params.roomname).emit('updateUserList', users.getUserList(params.roomname));
    // socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.to(params.roomname).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
    callback();
  });
  
  socket.on('createMessage', function(data){
    var user = users.getUser(socket.id);
    if (user && isRealString(data.text)) {
     socket.broadcast.to(user.room).emit('newMessage', generateMessage(user.name, data.text))
    }
  })

  socket.broadcast.on('createLocationMessage', (coords) => {
    var user = users.getUser(socket.id);
    if (user) {
      socket.broadcast.to(user.room).emit('newLocationMessage', locationLink(user.name, coords.latitude, coords.longitude));
    }
  });
  
  socket.on('disconnect', () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUserList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

