# BombParty
The Explosive Word Game

## The Game

### Overview

**BombParty** is a game where players take turns coming up with words that contain a specific series of letters. Each round starts with fifteen seconds on the clock, and like hot potato, the timer is passed from player to player.

### Lives

Each player starts with three lives. Each time the bomb explodes, the player whose turn it was loses a life, and the timer is reset to fifteen seconds.

Once you use every letter at least once, you regain a life. (I've never seen anyone actually do this)

### Words
The dictionary I'm using, `word-list-json`, does not include *most* names and other proper nouns, however, some do work. 

For a word to be valid, it has to be included in the dictionary, it must contain the rule (or the series of letters required), and it must not be exactly the same as the rule.

You can play BombParty [here](https://bombparty2.herokuapp.com). Please allow time for the both the client and server to cold start, which may lead to long load times.

![Screenshot](https://imgur.com/Tb18QPh)

## About

BombParty was made with Create React App. The source code for the client and server are on the `client` and `server` branches respectively.

I remade this game after the original version was taken offline.