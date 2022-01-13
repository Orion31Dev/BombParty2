import { useState } from 'react';
import { getCookie, setCookie } from '../cookies';

export default function CreateGame() {
  let [maxLives, setMaxLives] = useState('');
  let [name, setName] = useState(getCookie('name'));
  let [error, setError] = useState('');
  let [errorCode, setErrorCode] = useState('');

  function verifySettings() {
    if (parseInt(maxLives) <= 0) {
      setError('Max lives must be greater than 0');
      setErrorCode('ML67J');
      return false;
    }

    return true;
  }

  return (
    <div className="create-game">
      <a className="title" href="/">
        BombParty
      </a>
      <div className="home-input-section">
        <div className="sec-title">Create Game</div>
        <div className="room-code-wrapper">
          <div className="enter-room-code">[Enter Username]</div>
        </div>
        <input
          className="active"
          type="text"
          value={name}
          onChange={(e) => {
            setCookie('name', e.target.value, 1);
            setName(e.target.value);
          }}
          placeholder="Player"
          maxLength={7}
        />
        <div className="home-input-margin" />
        <div className="room-code-wrapper">
          <div className="enter-room-code right">[Max Lives]</div>
        </div>
        <input
          type="text"
          maxLength={2}
          placeholder={'3'}
          value={maxLives}
          onChange={(e: any) => {
            if (e.target.value.match(/^[0-9]*$/)) setMaxLives(e.target.value);
          }}
        />
      </div>
      <div className="home-input-margin" />
      <button
        onClick={() => {
          if (verifySettings()) createGame(maxLives);
        }}
      >
        Create
      </button>
      <div className="error">
        {error !== '' && <span>Error {errorCode}:</span>} {error}
      </div>
    </div>
  );
}

async function createGame(maxLives: string) {
  window.localStorage.setItem('createMaxLives', maxLives);

  const servers = await fetchServers();

  let code = randomString(5);

  // eslint-disable-next-line no-loop-func -- I don't get it lol
  while (servers.some((s: any) => s.name === code)) code = randomString(5);

  window.localStorage.setItem('createCode', code);

  window.location.href = '/game/' + code;
}

function randomString(length: number) {
  const chars = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';

  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

async function fetchServers() {
  let response = await fetch('https://server-bombparty2.herokuapp.com/servers');
  let data = await response.json();
  return data;
}
