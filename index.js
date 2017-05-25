const Koa = require('koa');
const serve = require('koa-static');
const path = require('path');

const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

app.use(serve(path.join(__dirname, '/')));

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('disconnect', () => console.log('user disconnected'));

  socket.on('chat message', (msg) => io.emit('chat message', msg));
});

server.listen(3000);