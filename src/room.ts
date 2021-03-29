const words = require('word-list-json');

const STARTING_TIME = 15 * 1000;
const MAX_LIVES = 3;

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export class Room {
  name: string;
  players: Player[];
  playing: boolean;
  turn: number;
  cascadeCount: number;
  rule: string;
  startTime: number;
  time: number;
  checkTimeInterval: any;
  startGame: number;
  startGameInterval: any;

  constructor(name: string, players: Player[]) {
    this.name = name;
    this.players = players;
    this.playing = false;
    this.turn = -1;
    this.startGame = -1;
    this.cascadeCount = 0;

    this.genRule();
  }

  beginCountdown() {
    if (this.players.length < 2 || this.playing) return;
    this.startGame = Date.now() + 15000;
    this.startGameInterval = setInterval(() => {
      if (Date.now() > this.startGame) {
        this.start();
        return;
      }
      this.broadcast('countdown', this.startGame - Date.now());
    }, 100);
  }

  start() {
    clearInterval(this.startGameInterval);
    this.startGame = -1;
    this.broadcast('countdown', -1);

    if (this.players.length < 2 || this.playing) return;
    this.players.forEach((p) => {
      p.playing = true;
      p.lives = MAX_LIVES;
    });

    this.nextTurn(false);

    this.broadcastPlayers();
    this.broadcast('turn', this.players[this.turn].id);

    this.broadcast('speed', 0.005);

    this.startTime = Date.now();
    this.time = STARTING_TIME;

    this.playing = true;
    this.broadcast('status', 'playing');

    this.checkTimeInterval = setInterval(() => this.checkTime(this), 200);
  }

  stop() {
    clearInterval(this.checkTimeInterval);
    clearInterval(this.startGameInterval);

    this.broadcast('countdown', -1);

    this.turn = -1;
    this.startGame = -1;
    this.playing = false;

    this.players.forEach((p) => {
      p.playing = false;
      p.alpha = ALPHABET;
    });

    this.broadcastPlayers();
    this.broadcastAlphabets();

    this.broadcast('status', 'waiting');
    this.broadcast('turn', -1);
  }

  checkTime(room: Room) {
    const remaining = (room.time - (Date.now() - room.startTime)) / 1000;

    if (remaining < 0) {
      room.players[room.turn].lives--;

      this.broadcast('audio', 'explode');

      room.startTime = Date.now();
      room.time = STARTING_TIME;

      room.broadcastPlayers();
      room.nextTurn(true);
      return;
    }

    if (remaining < 3) {
      room.broadcast('speed', 0.13);
      return;
    }

    if (remaining < 5) {
      room.broadcast('speed', 0.1);
      return;
    }

    if (remaining < 7) {
      room.broadcast('speed', 0.07);
      return;
    }

    room.broadcast('speed', 0.05);
    return;
  }

  genRule(): string {
    this.cascadeCount = 0;

    let word = words[randomRange(0, words.length)];

    let leng = 0;
    if (Math.random() >= 0.5) {
      leng = 2;
    } else {
      leng = 3;
    }

    if (word.length < leng) {
      this.rule = this.genRule(); // prevent the word from being too short to generate letters based on it
    }
    this.rule = word.substr(randomRange(0, word.length - leng), leng);

    console.log(this.rule + ' from ' + word);

    this.broadcast('rule', this.rule);

    return this.rule;
  }

  submit = (word: string) => {
    // "Error" Codes to add to the vibe
    if (word === this.rule) this.broadcast('error', '1F451:The word cannot equal the rule');
    else if (!word.includes(this.rule)) this.broadcast('error', '2N9L7:The word must contain the rule');
    else if (!words.includes(word)) this.broadcast('error', 'L48QB:The word must be a real word');
    else {
      this.time += 1700;

      // If players uses each letter once, s/he gets a life back
      let arr = this.players[this.turn].alpha.split('');

      this.players[this.turn].alpha = arr
        .map((l) => {
          if (word.includes(l.toLowerCase())) return ' ';
          else return l;
        })
        .join('');

      if (this.players[this.turn].alpha.replace(/\s/g, '').length < 1) {
        this.players[this.turn].alpha = ALPHABET;
        if (this.players[this.turn].lives < 3) {
          this.players[this.turn].lives++;
          this.broadcastPlayers();
          this.broadcast('audio', 'life');
        }
      }

      this.players[this.turn].socket.emit('alpha', this.players[this.turn].alpha);

      this.nextTurn(false);

      this.players.forEach((p) => {
        if (p.id !== this.turn) p.socket.emit('audio', 'turn');
      });

      return;
    }

    this.broadcast('audio', 'bad-guess');
  };

  broadcast = (evt: string, msg: any) => {
    this.players.forEach((p) => {
      p.socket.emit(evt, msg);
    });
  };

  addPlayer = (player: Player) => {
    this.players.push(player);
    player.socket.emit('rule', this.rule);
    player.socket.emit('status', this.playing ? 'playing' : 'waiting');
    if (this.players.length === 2) this.beginCountdown();
  };

  removePlayer = (socket: any) => {
    this.players = this.players.filter((p) => p.socket !== socket);
    if (!this.players[this.turn]) this.nextTurn(true); // Player left during turn

    if (this.players.length < 2) this.stop();
  };

  broadcastPlayers = () => {
    this.broadcast('players', playerListToSend(this));
  };

  broadcastAlphabets = () => {
    this.players.forEach((p) => p.socket.emit('alpha', p.alpha));
  };

  nextTurn = (cascade: boolean) => {
    const inArr = this.players.filter((p) => p.lives > 0 && p.playing); // Players who are "in" the game (alive and not waiting)
    if (inArr.length < 2) {
      if (inArr.length === 1) this.broadcast('winner', inArr[0].name + ` (${inArr[0].id})`);
      else this.broadcast('winner', '');

      this.stop();
      this.beginCountdown();
      return;
    }

    this.turn++;
    if (this.turn >= this.players.length) this.turn = 0;

    if (!this.players[this.turn].playing || this.players[this.turn].lives < 1) {
      this.nextTurn(cascade);
      return;
    }

    this.broadcast('turn', this.players[this.turn].id);
    this.players[this.turn].socket.emit('audio', 'your-turn');

    this.cascadeCount++;
    if (!cascade || this.cascadeCount >= this.players.filter((p) => p.playing).length) this.genRule();
  };
}

function playerListToSend(room: Room) {
  return room.players.map((p) => {
    return {
      id: p.id,
      name: p.name,
      lives: p.lives,
      playing: p.playing,
    };
  });
}

export interface Player {
  id: number;
  name: string;
  lives: number;
  playing: boolean;
  socket: any;
  alpha: string;
}

const randomRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min) + min);
};
