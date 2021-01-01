import React from 'react';
import bomb from '../bomb.svg';

interface BombProps {
  speed: number;
  turn: boolean;
}


interface BombState {
  opacity: number;
  countUp: boolean;
}

export class Bomb extends React.Component<BombProps, BombState> {
  interval: any;

  constructor(props: BombProps) {
    super(props);

    this.state = {
      opacity: 1,
      countUp: false,
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => {
      let newOpacity: number;
      let newCountUp = this.state.countUp;
      if (this.state.countUp) newOpacity = this.state.opacity + this.props.speed;
      else newOpacity = this.state.opacity - this.props.speed;

      if (this.state.opacity > 1) newCountUp = false;
      if (this.state.opacity < 0.7) newCountUp = true;

      this.setState((p) => {
        return {
          ...p,
          opacity: newOpacity,
          countUp: newCountUp,
        };
      });
    }, 50);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div className="bomb">
        <img src={bomb} className={this.props.turn ? 'bomb-turn' : ''} alt="bomb" style={{ opacity: this.state.opacity }} />
      </div>
    );
  }
}

/*
export class Bomb extends React.Component<BombProps> {
  render() {
    let style = { '--bomb-width': this.props.speed } as React.CSSProperties;

    return (
      <div style={style} className="bomb">
        <img src={bomb} alt="bomb" />
      </div>
    );
  }
}
*/