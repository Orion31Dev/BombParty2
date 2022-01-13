import React, { useEffect, useState } from 'react';
import { getCookie, setCookie } from '../cookies';

export default function ServerBrowser() {
  let [fetching, setFetching] = useState(true);
  let [servers, setServers] = useState([] as any[]);

  let [name, setName] = useState(getCookie('name'));

  useEffect(() => {
    fetchServers().then((servers) => {
      setFetching(false);
      setServers(servers);
    });
  }, []);

  return (
    <div>
      <a className="title" href="/">
        BombParty
      </a>
      <div className="home-input-section">
        <div className="sec-title">Server Browser</div>
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
        {fetching ? (
          <div className="loading">Loading...</div>
        ) : (
          servers.map((s) => <Server name={s.name} players={s.players} key={s.name} />)
        )}
      </div>
    </div>
  );
}

function Server(props: { name: string; players: number }) {
  return (
    <a className="server" href={'/game/' + props.name}>
      <div className="name">{props.name}</div>
      <div className="player-count">{props.players} players</div>
    </a>
  );
}

async function fetchServers() {
  let response = await fetch('http://localhost:4000/servers');
  let data = await response.json();
  console.log(data);
  return data;
}
