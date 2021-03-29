import React from 'react';
import alert from '../alert.svg';
import heart from '../heart.svg';
import heartFilled from '../heart filled.svg';
import { io } from 'socket.io-client';
import { Bomb } from '../components/Bomb';
import { getCookie } from '../cookies';
import { enableSound, loadSound, playSound, soundOn } from '../audio';

interface GameProps {
  match: any; // from react router
}

interface GameState {
  rule: string;
  cur: string;
  error: string;
  errorCode: string;
  status: string;
  winner: string;
  players: Player[];
  turn: number;
  width: number;
  speed: number;
  countdown: number;
  alpha: string[];
}

interface Player {
  id: number;
  name: string;
  lives: number;
  playing: boolean;
}

export class Game extends React.Component<GameProps, GameState> {
  socket: any;
  userId: number;
  textInput: any;

  constructor(props: GameProps) {
    super(props);
    this.state = {
      rule: '',
      cur: '',
      error: '',
      errorCode: '',
      players: [],
      turn: -1,
      width: window.innerWidth,
      speed: 0.005,
      status: '',
      winner: '',
      countdown: -1,
      alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    };

    this.textInput = React.createRef();
    this.focus = this.focus.bind(this);

    setInterval(this.focus, 100);

    this.userId = -2;

    loadSound('turn', 'turn.wav');
    loadSound('bad-guess', 'bad-guess.wav');
    loadSound('explode', 'explode.wav');
    loadSound('your-turn', 'your-turn.wav');
    loadSound('life', 'life.wav');
  }

  focus() {
    setTimeout(() => {
      try {
        // Sometimes null, but unfortunately the setTimeout in an interval is the only thing that gets auto focus to work
        this.textInput.current.focus();
      } catch (e) {}
    }, 100);
  }

  componentDidMount() {
    this.socket = io('wss://server-bombparty2.herokuapp.com', { transports: ['websocket'], upgrade: false });
    //this.socket = io('http://localhost:4000', { transports: ['websocket'], upgrade: false });

    this.socket.emit('join', this.props.match.params.room + ':' + getCookie('name'));

    this.socket.on('yourid', (msg: number) => (this.userId = msg));

    this.socket.on('alpha', (msg: string) => {
      console.log(msg);
      this.setState({ alpha: msg.split('') });
    });

    this.socket.on('word', (msg: string) => {
      if (this.userId !== this.state.turn) {
        this.setState({ cur: msg });
      }
      this.setError('', '');
    });

    this.socket.on('countdown', (msg: number) => {
      this.setState({ countdown: msg });
    });

    this.socket.on('speed', (msg: number) => {
      this.setState({ speed: msg });
    });

    this.socket.on('turn', (msg: number) => {
      this.setState({ turn: msg, cur: '' });
      if (this.state.status !== 'playing') return;
    });

    this.socket.on('winner', (msg: string) => {
      this.setState({ winner: msg });
    });

    this.socket.on('status', (msg: string) => {
      if (msg === 'playing') {
        this.setState({ countdown: -1 });
      }
      this.setState({ status: msg });
    });

    this.socket.on('players', (msg: Player[]) => {
      this.setState({ players: msg });
    });

    // Something is wrong with submitted word
    this.socket.on('error', (msg: string) => {
      this.setError(msg.split(':')[0], msg.split(':')[1]);
    });

    this.socket.on('audio', (msg: string) => {
      playSound(msg);
    });

    this.socket.on('rule', (msg: string) => {
      this.setState({ rule: msg });
    });

    window.addEventListener('resize', this.updateWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth);
  }

  render() {
    if (this.userId === this.state.turn) {
      document.documentElement.style.setProperty('--accent', '#ff003c');
      document.documentElement.style.setProperty('--secondary', '#f9f203');
    } else {
      document.documentElement.style.setProperty('--accent', '#f9f203');
      document.documentElement.style.setProperty('--secondary', '#ff003c');
    }

    return (
      <div className="Game" onClick={enableSound}>
        <div className="title">
          BombParty <span>------------------------------------- v1.1</span>
        </div>
        {this.state.turn === this.userId && (
          <div className="warning">
            <img src={alert} alt="warning" className="alert" />
            <div>
              <div>Warning</div>
              <span>It is currently your turn</span>
            </div>
          </div>
        )}

        {!soundOn && (
          <div className="no-sound">
            <span>Click to enable sound</span>
          </div>
        )}

        <div className="players">
          <span>Player List</span>
          {this.limitPlayersIfMobile().map((p) => {
            return (
              <div className="p-row" key={p.id}>
                <div className="player">
                  {p.id === this.state.turn && <div className="turn-arrow">{'>'}</div>}
                  {p.name} ({p.id}) <span className="status">{this.renderStatus(p)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {this.state.status === 'playing' ? (
          <Bomb turn={this.userId === this.state.turn} speed={this.state.speed} />
        ) : (
          <div className="game-waiting">
            <div>
              {this.state.countdown > -1 ? `Starting In ${(this.state.countdown / 1000).toFixed(3)}` : 'Waiting For Players'}
              <span className="winner">[!] {this.state.winner === '' ? 'Status 2H6J7' : 'Winner: ' + this.state.winner}</span>
            </div>
          </div>
        )}

        {this.state.status === 'playing' && (
          <div className="input-section">
            <div className="quick">
              Quick, enter a word that contains <span>{this.state.rule}</span>
            </div>
            <input
              ref={this.textInput}
              className={'word' + (this.state.turn === this.userId ? ' active' : '')}
              maxLength={19}
              placeholder={this.state.turn === this.userId ? '[type here]' : '[waiting]'}
              value={this.state.cur}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              disabled={this.state.turn !== this.userId}
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^[0-9a-zA-Z(\-)']+$/;
                if (value.match(regex) || value === '') {
                  this.socket.emit('word', value.toLowerCase());

                  this.setState({ cur: value });
                  this.setError('', '');
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') this.submit();
              }}
            />
            {/* Shows what is wrong with the input (if there is something wrong) */}
            <div className="error">
              {this.state.error !== '' && <span>Error {this.state.errorCode}:</span>} {this.state.error}
            </div>
          </div>
        )}
        <div className="alpha">{this.renderLetters()}</div>
      </div>
    );
  }

  renderLetters = () => {
    let i = 0;
    return this.state.alpha.map((l) => {
      return (
        <span key={i++} className="letter">
          {l}
        </span>
      );
    });
  };

  limitPlayersIfMobile = () => {
    if (this.state.width > 1021) {
      return this.state.players;
    } else {
      return this.state.players.slice(0, 3);
    }
  };

  renderStatus = (player: Player) => {
    if (!player.playing) return <div className="waiting">waiting</div>;
    if (player.lives < 1) return <div className="waiting">out</div>;

    let arr = [];
    for (let i = 0; i < 3; i++) {
      if (player.lives > i) {
        arr.push(<img key={i} src={heartFilled} alt="♥" />);
      } else {
        arr.push(<img key={i} src={heart} alt="" />);
      }
    }
    return arr;
  };

  submit = () => {
    this.socket.emit('submit', this.state.cur.toLowerCase());
  };

  updateWidth = () => {
    this.setState({ width: window.innerWidth });
  };

  setError = (code: string, text: string) => {
    this.setState({ error: text, errorCode: code });
  };
}
