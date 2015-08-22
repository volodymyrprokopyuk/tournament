# Tournament Most Valuable Player calculation

## Problem


## Solution

## Input

```
[ games/basketball.txt ]
BASKETBALL
player 1;nick1;4;Team A;G;10;2;7
player 2;nick2;8;Team A;F;0;10;0
player 3;nick3;15;Team A;C;15;10;4
player 4;nick4;16;Team B;G;20;0;0
player 5;nick5;23;Team B;F;4;7;7
player 6;nick6;42;Team B;C;8;10;0

[ games/handball.txt ]
HANDBALL
player 1;nick1;4;Team A;G;0;20
player 2;nick2;8;Team A;F;15;20
player 3;nick3;15;Team A;F;10;20
player 4;nick4;16;Team B;G;1;25
player 5;nick5;23;Team B;F;12;25
player 6;nick6;42;Team B;F;8;25
```

## Output

```javascript
{ name: 'player 3',
  nickname: 'nick3',
  number: '15',
  position: null,
  points: 82,
  positions:
   [ { sport: 'basketball',
       game: 'games/basketball.txt',
       team: 'Team A',
       position: 'C',
       score: 15,
       rebounds: 10,
       assists: 4 },
     { sport: 'handball',
       game: 'games/handball.txt',
       team: 'Team A',
       position: 'F',
       made: 10,
       recieved: 20 } ] }
```

## Install

```bash
$ git clone https://github.com/volodymyrprokopyuk/tournament.git
$ cd tournament
$ npm install
$ node main.js
```
