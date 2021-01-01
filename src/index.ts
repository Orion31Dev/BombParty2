import express from 'express';
import { Room, Player, ALPHABET } from './room';

const app = express();

var http = require('http').createServer(app);

const whitelist = ['https://bombparty2.herokuapp.com', 'http://localhost:3000'];

const io: any = require('socket.io')(http, {
  cors: {
    origin: function (origin: any, callback: any) {
      if (whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

let cId = 0;

let rooms: Room[] = [];
let roomsBySockets: string[] = [];
let idsBySockets: number[] = [];

http.listen(process.env.PORT || 4000);

io.on('connect', (socket: any) => {
  socket.on('join', (msg: string) => {
    const roomName: string = msg.split(':')[0];
    const name: string = msg.split(':')[1];

    let room = getRoom(roomName); // any so that the room.players in the broadcast() works
    if (room === -1) {
      room = new Room(roomName, [createPlayer(name, socket, false)]);
      rooms.push(room);
    } else {
      room.addPlayer(createPlayer(name, socket, false));
    }

    roomsBySockets[socket.id] = room.name;
    idsBySockets[socket.id] = cId;

    room.broadcastPlayers();
  });

  socket.on('word', (msg: string) => {
    let room = getRoom(roomsBySockets[socket.id]);
    if (room === -1) return;

    room.broadcast('word', msg);
  });

  socket.on('submit', (msg: string) => {
    let room = getRoom(roomsBySockets[socket.id]);
    if (room === -1) return;

    if (idsBySockets[socket.id] !== room.players[room.turn].id) return;

    room.submit(msg);
  });

  socket.on('disconnect', () => {
    let gr = getRoom(roomsBySockets[socket.id]);
    if (gr === -1) return;
    else {
      let room = gr as Room;

      room.removePlayer(socket);

      if (room.players.length === 0) {
        rooms = rooms.filter((r) => r.name !== room.name);
      } else {
        room.broadcastPlayers();
      }
    }
  });
});

const getRoom: (room: string) => Room | -1 = (room: string) => {
  for (const r of rooms) {
    if (r.name === room) return r;
  }

  return -1;
};

const createPlayer: (name: string, socket: any, playing: boolean) => Player = (name: string, socket: any, playing: boolean) => {
  socket.emit('yourid', ++cId);

  return {
    id: cId,
    name: name,
    lives: 3,
    playing: playing,
    socket: socket,
    alpha: ALPHABET,
  };
};
