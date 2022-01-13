import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import './App.css';
import { Home } from './routes/Home';
import { Game } from './routes/Game';
import { Page404 } from './routes/404';
import ServerBrowser from './routes/ServerBrowser';
import CreateGame from './routes/CreateGame';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path={'/'}>
          <Home></Home>
        </Route>
        <Route exact path={'/game/:room'} component={Game} />
        <Route exact path={'/servers'} component={ServerBrowser} />
        <Route exact path={'/create'} component={CreateGame} />
        <Route exact path={'*'}>
          <Page404></Page404>
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
