import React from 'react';
import alert from '../alert.svg';
import heart from '../heart.svg';
import heartFilled from '../heart filled.svg';
import { io } from 'socket.io-client';
import { Bomb } from '../components/Bomb';
import { getCookie } from '../cookies';

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
  input: any;

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
    };

    this.userId = -2;
  }

  componentDidMount() {
    this.socket = io('wss://server-bombparty2.herokuapp.com', { transports: ['websocket'], upgrade: false });
    //this.socket = io('http://localhost:4000', { transports: ['websocket'], upgrade: false });

    this.socket.emit('join', this.props.match.params.room + ':' + getCookie('name'));

    this.socket.on('yourid', (msg: number) => (this.userId = msg));

    this.socket.on('word', (msg: string) => {
      if (this.userId !== this.state.turn) {
        this.setState({ cur: msg });
      }
    });

    this.socket.on('countdown', (msg: number) => {
      this.setState({ countdown: msg });
    });

    this.socket.on('speed', (msg: number) => {
      this.setState({ speed: msg });
    });

    this.socket.on('turn', (msg: number) => {
      if (msg === this.userId) this.input.focus();
      this.setState({ turn: msg, cur: '' });
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

    this.socket.on('rule', (msg: string) => {
      this.setState({ rule: msg });
    });

    window.addEventListener('resize', this.updateWidth);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWidth);
  }

  render() {
    return (
      <div className="Game">
        <div className="title">
          BombParty <span>------------------------------------- v1.0</span>
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
          <Bomb speed={this.state.speed} />
        ) : (
          <div className="game-waiting">
            <div>
              {this.state.countdown > -1 ? `Starting In ${(this.state.countdown / 1000).toFixed(3)}` : 'Waiting For Players'}
              <span className="winner">[!] {this.state.winner === '' ? 'Error 2H6J7' : 'Winner: ' + this.state.winner}</span>
            </div>
          </div>
        )}

        {this.state.status === 'playing' && (
          <div className="input-section">
            <div className="quick">
              Quick, enter a word that contains <span>{this.state.rule}</span>
            </div>
            <input
              ref={(input) => { this.input = input }}
              className={'word' + (this.state.turn === this.userId ? ' active' : '')}
              maxLength={19}
              placeholder={this.state.turn === this.userId ? '[type here]' : '[waiting]'}
              value={this.state.cur}
              disabled={this.state.turn !== this.userId}
              onChange={(e) => {
                const value = e.target.value;
                const regex = /^[0-9a-zA-Z(\-)']+$/;
                if (value.match(regex) || value === '') {
                  this.socket.emit('word', value);

                  this.setState({ cur: value });

                  this.setError('', ''); // Reset the error
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
      </div>
    );
  }

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
    this.socket.emit('submit', this.state.cur);
  };

  updateWidth = () => {
    this.setState({ width: window.innerWidth });
  };

  setError = (code: string, text: string) => {
    this.setState({ error: text, errorCode: code });
  };
}