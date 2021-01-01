import React from 'react';
import bomb from '../bomb.svg';

interface BombProps {
  speed: number;
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
      if (this.state.opacity < 0.5) newCountUp = true;

      this.setState((p) => {
        return {
          ...p,
          opacity: newOpacity,
          countUp: newCountUp,
        };
      });
    }, 100);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div className="bomb">
        <img src={bomb} alt="bomb" style={{ opacity: this.state.opacity }} />
      </div>
    );
  }
}
