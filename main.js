var fs = require('fs');
var _ = require('lodash');

// player type with position in each game and its all tournament positions
var Player = function(name, nickname, number) {
  this.name = name || '';
  this.nickname = nickname || '';
  this.number = number || '';
  this.position = null;
  this.points = 0;
  this.positions = [ ];
};

// position variant for basketball
var BPosition = function(sport, game, team, position, score, rebounds, assists) {
  this.sport = sport || '';
  this.game = game || '';
  this.team = team || '';
  this.position = position || '';
  this.score = score || 0;
  this.rebounds = rebounds || 0;
  this.assists = assists || 0;
  this.winner = false;
};

// basketball player points calculation rules
BPosition.prototype.calculatePoints = function() {
  var rules = {
    default: { score: 1, rebounds: 1, assists: 1 }
    , G: { score: 2, rebounds: 3, assists: 1 }
    , F: { score: 2, rebounds: 2, assists: 2 }
    , C: { score: 2, rebounds: 1, assists: 3 }
  };
  var rule = _.has(rules, this.position)
    ? rules[this.position] : rules['default'];
  return this.score * rule.score + this.rebounds * rule.rebounds
    + this.assists * rule.assists;
};

// position variant for handball
var HPosition = function(sport, game, team, position, made, received) {
  this.sport = sport || '';
  this.game = game || '';
  this.team = team || '';
  this.position = position || '';
  this.made = made || 0;
  this.received = received || 0;
  this.winner = false;
};

// handball player points calculation rules
HPosition.prototype.calculatePoints = function() {
  var rules = {
    default: { initial: 10, made: 2, received: -1 }
    , G: { initial: 50, made: 5, received: -2 }
    , F: { initial: 20, made: 1, received: -1 }
  };
  var rule = _.has(rules, this.position)
    ? rules[this.position] : rules['default'];
  return rule.initial + this.made * rule.made
    + this.received * rule.received;
};

// *** ADD NEW POSITION VARIANTS WITH CORRESPONDING POINTS CACLULATION RULES HERE

// team type with players and totalPoints caclulated by appropriate mixin
var Team = function(sport, game, name, players) {
  this.sport = sport || '';
  this.game = game || '';
  this.name = name || '';
  this.players = players || [ ];
  this.totalPoints = 0;
};

// default mixin for Team.totalPoints caclulation
var calculateDefaultTotalPoints = function() {
  this.totalPoints = _.sum(this.players, 'points');
};

// basketball mixin for Team.totalPoints caclulation
var calculateBasketballTotalPoints = function() {
  this.totalPoints = _.sum(this.players, 'points');
};

// handball mixin for Team.totalPoints caclulation
var calculateHandballTotalPoints = function() {
  this.totalPoints = _.sum(this.players, 'position.made');
};

// *** ADD NEW Team.totalPoints CALCULATION ALGORITHMS HERE

// basketball input statistics file parser
var parseBasketball = function(game, rawGame) {
  var players = [ ];
  var m = null;
  var rPlayer = /^([a-z][^;]*);([^;]+);([^;]+);([^;]+);([^;]+);(\d+);(\d+);(\d+)$/mg;
  while ((m = rPlayer.exec(rawGame)) !== null) {
    var player = new Player(m[1], m[2], m[3]);
    var bposition = new BPosition('basketball', game, m[4], m[5]
      , parseInt(m[6]), parseInt(m[7]), parseInt(m[8]));
    player.position = bposition;
    players.push(player);
  };
  return players;
};

// handball input statistics file parser
var parseHandball = function(game, rawGame) {
  var players = [ ];
  var m = null;
  var rPlayer = /^([a-z][^;]*);([^;]+);([^;]+);([^;]+);([^;]+);(\d+);(\d+)$/mg;
  while ((m = rPlayer.exec(rawGame)) !== null) {
    var player = new Player(m[1], m[2], m[3]);
    var hposition = new HPosition('handball', game, m[4], m[5]
      , parseInt(m[6]), parseInt(m[7]));
    player.position = hposition;
    players.push(player);
  };
  return players;
};

// *** ADD NEW INPUT STATISTICS FILE PARSERS HERE

// calculate Player.points in corresponding position before knowing winner team
var calculatePlayersPoints = function(players) {
  var calculatePoints = function(player) {
    player.points = player.position.calculatePoints();
    return player;
  };
  return _.map(players, calculatePoints);
};

// recalculate Player.points in corresponding position after knowing winner team
var recalculateWinnersPoints = function(players) {
  var calculateTeamTotalPoints = function(players, name) {
    var totalPointsMixin = {
      default: calculateDefaultTotalPoints
      , basketball: calculateBasketballTotalPoints
      , handball: calculateHandballTotalPoints
    };
    var sport = _.first(players).position.sport;
    var game = _.first(players).position.game;
    var team = new Team(sport, game, name, players);
    var calculateTotalPoints = _.has(totalPointsMixin, sport)
      ? totalPointsMixin[sport] : totalPointsMixin['default'];
    _.mixin(team, { calculateTotalPoints: calculateTotalPoints });
    // caclulate Team.totalPoints using corresponding mixin mixed in dynamically
    team.calculateTotalPoints();
    return team;
  };
  var winnerTeam = _.chain(players).groupBy('position.team')
     .map(calculateTeamTotalPoints).max('totalPoints').value();
  // add 10 extra points to all players of winner team
  var addExtraPoints = function(player) {
    player.points += 10;
    player.position.winner = true;
  };
  _.map(winnerTeam.players, addExtraPoints);
  return players;
};

var processGames = function(files) {
  var processGame = function(file) {
    var readGame = _.partial(fs.readFileSync, file, 'utf8');
    var parseGame = function(rawGame) {
      var parsers = { basketball: parseBasketball, handball: parseHandball };
      var m = rawGame.match(/^[A-Z]+$/m);
      var sport = m ? m[0].toLowerCase() : '';
      // dynamically select appropriate parser
      return _.has(parsers, sport) ? parsers[sport](file, rawGame) : [ ];
    };
    return _.flow(readGame, parseGame, calculatePlayersPoints
      , recalculateWinnersPoints)();
  };
  return _.map(files, processGame);
};
// *** ADD NEW GAME STATS FILES HERE
processGames = _.partial(processGames
  , [ 'games/basketball.txt', 'games/handball.txt' ]);

// aggregate players points
var aggregatePlayersPoints = function(players) {
  var aggregatePoints = function(samePlayers) {
    var player = _.first(samePlayers);
    // sum player points in all games
    player.points = _.sum(samePlayers, 'points');
    // save all player position during tournament
    player.positions = _.pluck(samePlayers, 'position');
    player.position = null;
    return player;
  };
  return _.chain(players).flatten().groupBy('nickname').map(aggregatePoints)
    .value();
};

// calculate Most Valuable Player according to its points
var calculateMVP = _.partial(_.max, _, 'points');

_.flow(processGames, aggregatePlayersPoints, calculateMVP, console.log)();
