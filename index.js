const Koa = require('koa');
const serve = require('koa-static');
const path = require('path');
const cookie = require('cookie');

const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

app.use(serve(path.join(__dirname, '/')));

let uid = 1;

io.on('connection', (socket) => {
  socket.emit('set name', `user${uid}`);
  socket.request.headers.cookie += `; id=${uid}`;
  
  const connectedMsg = `user${uid} connected`;
  console.log(connectedMsg);
  io.emit('chat message', connectedMsg);
  
  uid ++;

  socket.on('disconnect', () => {
    const disMsg = `user${cookie.parse(socket.request.headers.cookie).id} disconnect`;
    console.log(disMsg);
    io.emit('chat message', disMsg);
  });

  socket.on('chat message', (msg) => io.emit('chat message', msg));
});

server.listen(3000);