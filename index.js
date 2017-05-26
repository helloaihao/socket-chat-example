const Koa = require('koa');
const serve = require('koa-static');
const path = require('path');
const cookie = require('cookie');

const app = new Koa();
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

app.use(serve(path.join(__dirname, '/')));

let uid = 1; // 用户 id
let onlineIds = [];
// 用户连接事件
io.on('connection', (socket) => {
  socket.emit('set name', `user${uid}`);
  socket.request.headers.cookie += `; id=${uid}`; // 设置 cookie 保存用户 id 用于记录用户离线

  const connectedMsg = `user${uid} connected`;
  console.log(connectedMsg);
  io.emit('chat message', connectedMsg);  // 新用户用户连接消息
  
  onlineIds.push(uid);  // 添加到在线用户列表
  io.emit('online id list', onlineIds);
  uid ++;

  // 用户断开连接
  socket.on('disconnect', () => {
    const disId = cookie.parse(socket.request.headers.cookie).id;
    const disMsg = `user${disId} disconnect`;
    console.log(disMsg);
    io.emit('chat message', disMsg);  // 用户离线消息

    onlineIds = onlineIds.filter(function (id) {
      return id !== +disId;
    });
    console.log(onlineIds);
    io.emit('online id list', onlineIds);
  });

  // 接收用户消息并转发给除自己之外的所有人
  socket.on('chat message', (msg) =>  socket.broadcast.emit('chat message', msg));

  // 显示"正在输入"功能
  socket.on('typing', () => socket.broadcast.emit('typing', cookie.parse(socket.request.headers.cookie).id));
});

server.listen(3000);