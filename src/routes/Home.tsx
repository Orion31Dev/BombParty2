import React from 'react';
import { getCookie, setCookie } from '../cookies';

interface HomeProps {}

interface HomeState {
  bpI: number;
  inI: number;
  vI: number;
  coI: number;
  up: boolean;
  input: boolean;
  code: string;
  name: string;
  error: string;
  errorCode: string;
  placeholder: string;
}

export class Home extends React.Component<HomeProps, HomeState> {
  bpInterval: any;
  inInterval: any;
  vInterval: any;

  constructor(props: HomeProps) {
    super(props);

    this.state = {
      bpI: 0,
      inI: 0,
      coI: 0,
      vI: 0,
      up: false,
      input: false,
      code: '',
      name: getCookie('name'),
      error: '',
      errorCode: '',
      placeholder: 'ABCDE',
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.bpInterval = setInterval(() => {
        this.setState({
          bpI: this.state.bpI + 1,
        });
        if (this.state.bpI >= 'BombParty'.length) clearInterval(this.bpInterval);
      }, 100);
    }, 1200);

    setTimeout(() => {
      this.inInterval = setInterval(() => {
        this.setState({
          inI: this.state.inI + 1,
        });
        if (this.state.inI >= 'Initializing Game'.length) clearInterval(this.inInterval);
      }, 50);
    }, 100);

    setTimeout(() => {
      this.vInterval = setInterval(() => {
        this.setState({
          vI: this.state.vI + 1,
        });
        if (this.state.vI >= 'Version 1.0'.length) clearInterval(this.vInterval);
      }, 50);
    }, 2000);

    setTimeout(() => {
      this.setState({ up: true });
    }, 3000);

    setTimeout(() => {
      this.setState({ input: true });
    }, 3400);

    setTimeout(() => {
      this.vInterval = setInterval(() => {
        this.setState({
          coI: this.state.coI + 1,
        });
        if (this.state.coI >= 'You consent to the use of cookies by clicking play'.length) clearInterval(this.vInterval);
      }, 30);
    }, 3400);

    setTimeout(() => {
      setInterval(() => {
        this.genRandomChar(0);
        setTimeout(() => this.genRandomChar(1), 50);
        setTimeout(() => this.genRandomChar(2), 100);
        setTimeout(() => this.genRandomChar(3), 150);
        setTimeout(() => this.genRandomChar(4), 200);
      }, 750);
    }, 3600);
  }

  render() {
    return (
      <div>
        {!this.state.up && (
          <div className="init">
            <span className="arrow">{'>'}</span> {'Initializing Game'.substr(0, this.state.inI)}
          </div>
        )}
        {this.state.input && (
          <div className="init">
            <span className="arrow">{'>'}</span> {'You consent to the use of cookies by continuing'.substr(0, this.state.coI)}
          </div>
        )}
        <div className={'home-title-container' + (this.state.up ? ' up' : '')}>
          <div className="home-title">
            {'BombParty'.substr(0, this.state.bpI)}
            <div className="version">{'Version 1.0'.substr('Version 1.0'.length - this.state.vI, 'Version 1.0'.length)}</div>
          </div>
        </div>
        {this.state.input ? (
          <div className="home-input-section">
            <input
              className="active"
              type="text"
              value={this.state.code}
              onChange={(e) => {
                this.setState({ code: e.target.value.toUpperCase() });
              }}
              placeholder={this.state.placeholder}
              maxLength={5}
              onKeyDown={(e) => {
                if (e.key === "Enter") this.submit();
              }}
            />
            <div className="room-code-wrapper">
              <div className="enter-room-code">[Enter Room Code]</div>
            </div>
            <div className="home-input-margin" />
            <input
              type="text"
              value={this.state.name}
              onChange={(e) => {
                setCookie('name', e.target.value, 1);
                this.setState({ name: e.target.value });
              }}
              placeholder="Player"
              maxLength={7}
              onKeyDown={(e) => {
                if (e.key === "Enter") this.submit();
              }}
            />
            <div className="room-code-wrapper">
              <div className="enter-room-code left">[Enter Username]</div>
            </div>
            <div className="home-input-margin" />
            <button
              className="active"
              onClick={() => {
                this.submit();
              }}
            >
              Play
            </button>
            <div className="error">
              {this.state.error !== '' && <span>Error {this.state.errorCode}:</span>} {this.state.error}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  genRandomChar = (place: number) => {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let arr = this.state.placeholder.split('');
    arr[place] = characters.charAt(Math.floor(Math.random() * characters.length));
    this.setState({ placeholder: arr.join('') });
  };

  setError = (code: string, text: string) => {
    this.setState({ error: text, errorCode: code });
  };

  submit() {
    if (this.state.code.length !== 5)
      this.setError('L5M4C', 'The code must be 5 characters long');
    else {
      window.location.href = '/game/' + this.state.code;
    }
  }
}
