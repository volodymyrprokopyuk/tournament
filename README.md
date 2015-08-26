# Tournament Most Valuable Player calculation

## Problem

Tucan Tournament is a tournament where several players compete in several
sports. Right now, the sports played are basketball and handball games. They
plan to add more sports in the future.

You have been contacted to create a program to calculate the Most Valuable
Player (MVP) of the tournament.

You will receive a set of files, each one containing the stats of one game. Each
file will start with a row indicating the sport it refers to.

Each player is assigned a unique nickname. Each file represent a single game.
The MVP is the player with the most rating points, adding the rating points in
all games.

A player will receive 10 additional rating points if their team won the game.
Every game must have a winner team. One player may play in different teams
and positions in different games, but not in the same game.

**Basketball**

Each row will represent one player stats, with the format:
`player name;nickname;number;team name;position;scored points;rebounds;assists`

This table details the rating points each player in a basketball game receives
depending on her position:

Position   | Score | Rebounds | Assists
:----------|------:|---------:|--------:
Guard(G)   |     2 |        3 |       1
Forward(F) |     2 |        2 |       2
Center(C)  |     2 |        1 |       3

E.g. a player playing as center with 10 scored points, 5 rebounds and no assists
will be granted 25 rating points `(10*2 + 5*1 + 0*3)`.

The winner team is the one with more scored points.

**Handball**

Each row will represent one player stats, with the format:
`player name;nickname;number;team name;position;goals made;goals received`

This table details the rating points each player in a handball game receives
depending on her position:

Position        | Initial points | Goals made | Goals received
:---------------|---------------:|-----------:|---------------:
Goalkeeper(G)   |             50 |          5 |             -2
Field player(F) |             20 |          1 |             -1

E.g. a player playing as goalkeeper with 1 goals made and 10 received will be
granted 35 rating points `(50 + 1*5 ­ 10*2 = 35)`.

The winner team is the one with more goals made.

## Solution

There is `Player` type with properties `position` that is a position in current
game and `positions` that are the positions that player took in all games of a
tournament.

The `Player.position` has two variants: `BPosition` for basketball positions and
`HPosition` for handball positions. Each position variant implements
corresponding `calculatePoints` algorithm.

The `Team` type represents team `players` and team `totalPoints` calculated in
accordance with `sport` type. The selection of the `totalPoints` calculation
method is done dynamically via **mixin**. There are three `totalPoints`
calculation mixin: `calculateBasketballTotalPoints`,
`calculateHandballTotalPoints` and `calculateDefaultTotalPoints`.

`parseBasketball` and `parseHandball` are extensible input statistics file
parsers implemented using **regular expressions** and selected dynamically
depending on input file content. These parsers are the only place in the
application where new objects `Player`, `BPosition` and `HPosition` are
created. All the calculations in the application is done using the same objects
and only creating lightweight lists and hash tables for intermediate results.
This makes the **sorting algorithm efficient**.

The **Most Valuable Player calculation algorithm**:
- For each input statistics game file `processGames`:
    - `readGame` from input file
    - `parseGame` using dynamically selected appropriate parser
    - `calculatePlayersPoints` applying correct `Position.calculatePoints`
      algorithm
    - `recalculateWinnersPoints` by:
        - grouping `players` by `team`
        - `caclulateTeamTotalPoints` using corresponding `totalPoints`
          calculation mixin
        - calculating `winnerTeam` in accordance with `totalPoints`
        - `addExtraPoints` to each `player` of `winnerTeam`
- `aggregatePlayersPoints` by
    - grouping all `players` in the tournament by `nickname`
    - `aggregatePoints` for each `nickname`
    - save all `nickname` positions during the tournament
- `calculateMVP` of the tournament based on `Player.points` aggregate value

The solution implements **efficient sorting algorithm** and can be **easily
extended** by:
- adding new `Position` variants and `Position.calculatePoints` algorithms
- adding new `Team.totalPoints` calculation mixins
- adding new input statistics file parsers

The rest of the application should work without changes.

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
       assists: 4,
       winner: true },
     { sport: 'handball',
       game: 'games/handball.txt',
       team: 'Team A',
       position: 'F',
       made: 10,
       received: 20,
       winner: true } ] }
```

The **Most Valuable Player** is the player with name `player 3` and nickname
`nick3`. The player has `82 points` in 2 positions:
- Position `C` in sport `basketball`, game `games/basketball.txt` and winner
  team `Team A`
- Position `F` in sport `handball`, game `games/handball.txt` and winner
  team `Team A`

## Install

```bash
$ git clone https://github.com/volodymyrprokopyuk/tournament.git
$ cd tournament
$ npm install
$ node main.js
```
