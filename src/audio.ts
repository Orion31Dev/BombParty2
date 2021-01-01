interface Sound {
  name: string;
  file: string;
  audio: HTMLAudioElement;
}

export let soundOn = false;

const sounds: Sound[] = [];

export const loadSound = (name: string, file: string) => {
  const audio = new Audio(window.location.origin + '/sfx/' + file);
  sounds.push({ name: name, file: file, audio: audio });
};

export const playSound = (name: string) => {
  if (!soundOn) return;
  sounds.filter((s) => s.name === name)[0].audio.play();
};

export const enableSound = () => {
  soundOn = true;
}