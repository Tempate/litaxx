// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"lib/move.ts":[function(require,module,exports) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Move = exports.MoveType = void 0;

var board_1 = require("./board");

var MoveType;

(function (MoveType) {
  MoveType[MoveType["Single"] = 0] = "Single";
  MoveType[MoveType["Double"] = 1] = "Double";
  MoveType[MoveType["Null"] = 2] = "Null";
})(MoveType = exports.MoveType || (exports.MoveType = {}));

var Move = /*#__PURE__*/function () {
  function Move(to, from) {
    _classCallCheck(this, Move);

    this.to = board_1.Board.coordinate_to_square(to);

    if (from == undefined) {
      this.type = MoveType.Single;
      this.from = -1;
    } else {
      this.type = MoveType.Double;
      this.from = board_1.Board.coordinate_to_square(from);
    }
  }

  _createClass(Move, [{
    key: "toString",
    value: function toString() {
      switch (this.type) {
        case MoveType.Single:
          return board_1.Board.square_to_coordinate(this.to);

        case MoveType.Double:
          return board_1.Board.square_to_coordinate(this.from) + board_1.Board.square_to_coordinate(this.to);

        case MoveType.Null:
          return '0000';
      }
    }
  }]);

  return Move;
}();

exports.Move = Move;
},{"./board":"lib/board.ts"}],"lib/board.ts":[function(require,module,exports) {
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Board = void 0;

var move_1 = require("./move");

var Player;

(function (Player) {
  Player[Player["White"] = 0] = "White";
  Player[Player["Black"] = 1] = "Black";
})(Player || (Player = {}));

var StoneType;

(function (StoneType) {
  StoneType[StoneType["Blank"] = 0] = "Blank";
  StoneType[StoneType["Gap"] = 1] = "Gap";
  StoneType[StoneType["White"] = 2] = "White";
  StoneType[StoneType["Black"] = 3] = "Black";
})(StoneType || (StoneType = {}));

var Board = /*#__PURE__*/function () {
  function Board() {
    _classCallCheck(this, Board);

    this.stones = [];

    for (var i = 0; i < 49; i++) {
      this.stones.push(StoneType.Blank);
    }

    this.turn = Player.Black;
    this.ply = 0;
    this.fifty_moves_counter = 0;
  }

  _createClass(Board, [{
    key: "to_fen",
    value: function to_fen() {
      var fen = "";

      for (var y = 6; y >= 0; y--) {
        for (var x = 0; x < 7; x++) {
          var square = y * 7 + x;
          var stone = this.stones[square];

          switch (stone) {
            case StoneType.Blank:
              // If the last character is a number, increase it.
              // Otherwise, append a 1.
              if (fen.length == 0 || isNaN(Number(fen.charAt(fen.length - 1)))) {
                fen += '1';
              } else {
                fen = fen.substring(0, fen.length - 1);
                fen += (Number(fen.charAt(fen.length - 1)) + 1).toString();
              }

              break;

            case StoneType.Black:
              fen += 'x';
              break;

            case StoneType.White:
              fen += 'o';
              break;

            case StoneType.Gap:
              fen += '-';
              break;
          }
        }

        fen += '/';
      }

      fen += ' ';
      fen += this.turn == Player.Black ? 'x' : 'o';
      fen += ' ';
      fen += this.fifty_moves_counter.toString();
      fen += ' ';
      fen += this.ply.toString();
      return fen;
    }
  }, {
    key: "from_fen",
    value: function from_fen(fen) {
      var fen_parts = fen.split(' '); // Load the board state

      var board_fen = fen_parts[0];
      var x = 0;
      var y = 6;

      for (var i = 0; i < board_fen.length; i++) {
        var square = y * 7 + x;
        var fen_char = board_fen.charAt(i);

        switch (fen_char) {
          case 'x':
            this.stones[square] = StoneType.Black;
            x++;
            break;

          case 'o':
            this.stones[square] = StoneType.White;
            x++;
            break;

          case '-':
            this.stones[square] = StoneType.Gap;
            x++;
            break;

          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
            // Add as many blank stones as the number indicates
            var blank_stones_count = fen.charCodeAt(i) - Number('0');

            for (var k = 0; k < blank_stones_count; k++) {
              this.stones[square + k] = StoneType.Blank;
            }

            x += blank_stones_count;
            break;

          case '/':
            x = 0;
            y--;
            break;
        }
      } // Load the turn


      switch (fen_parts[1].charAt(0)) {
        case 'x':
        case 'X':
        case 'b':
        case 'B':
          this.turn = Player.Black;
          break;

        case 'o':
        case 'O':
        case 'w':
        case 'W':
          this.turn = Player.White;
          break;
      } // Load counters


      this.fifty_moves_counter = Number(fen_parts[2]) - Number('0');
      this.ply = Number(fen_parts[3]) - Number('0');
    }
  }, {
    key: "is_legal",
    value: function is_legal(move) {
      var friendly_stone_type = this.turn == Player.White ? StoneType.White : StoneType.Black;

      if (move.type == move_1.MoveType.Null) {
        // Iterate through all blank squares and check that no friendly stone
        // can move or jump to it.
        for (var square = 0; square < this.stones.length; square++) {
          if (this.stones[square] != StoneType.Blank) continue;
          if (this.surrounding_stones(square, friendly_stone_type, 2).length > 0) return false;
        }

        return true;
      } // Check that move.to's value is within range


      if (move.to < 0 || move.to >= 49) return false; // Check that the destination is empty

      if (this.stones[move.to] != StoneType.Blank) return false;

      switch (move.type) {
        case move_1.MoveType.Single:
          // Check that there is an adjacent, friendly stone to make the move
          return this.surrounding_stones(move.to, friendly_stone_type, 1).length > 0;

        case move_1.MoveType.Double:
          // Check that move.from's value is within range
          if (move.from < 0 || move.from >= 49) return false; // Check that there's a friendly stone at the departure square

          return this.stones[move.from] == friendly_stone_type;
      }

      return false;
    }
  }, {
    key: "make",
    value: function make(move) {
      var _this = this;

      var friendly_stone_type;
      var hostile_stone_type;

      if (this.turn == Player.White) {
        friendly_stone_type = StoneType.White;
        hostile_stone_type = StoneType.Black;
      } else {
        friendly_stone_type = StoneType.Black;
        hostile_stone_type = StoneType.White;
      }

      var new_fifty_moves_counter = 0;

      switch (move.type) {
        case move_1.MoveType.Double:
          // Remove the stone that's jumping
          this.stones[move.from] = StoneType.Blank; // Increase the fifty-moves counter

          new_fifty_moves_counter = this.fifty_moves_counter + 1;
        // no break

        case move_1.MoveType.Single:
          // Place a friendly stone at the destination
          this.stones[move.to] = friendly_stone_type; // Capture all adjacent, hostile stones

          this.surrounding_stones(move.to, hostile_stone_type, 1).forEach(function (square) {
            _this.stones[square] = friendly_stone_type;
          });
          break;
      } // Swap the turn


      if (this.turn == Player.White) this.turn = Player.Black;else this.turn = Player.White; // Update the fifty-moves counter

      this.fifty_moves_counter = new_fifty_moves_counter;
      this.ply += 1;
    }
  }, {
    key: "reachable_squares",
    value: function reachable_squares(coordinate) {
      var square = Board.coordinate_to_square(coordinate);
      return this.surrounding_stones(square, StoneType.Blank, 2);
    } // List all the squares in the surroundings of a stone 
    // that contain stones of a given type.
    // The margin indicates how big those surroundings are.
    // For instance, a margin of 1 would comprehend adjacent squares.

  }, {
    key: "surrounding_stones",
    value: function surrounding_stones(square, type, margin) {
      var squares = [];
      var move_to_x = square % 7;
      var move_to_y = Math.floor(square / 7);

      for (var y = Math.max(0, move_to_y - margin); y <= Math.min(6, move_to_y + margin); y++) {
        for (var x = Math.max(0, move_to_x - margin); x <= Math.min(6, move_to_x + margin); x++) {
          var pos = y * 7 + x;
          if (this.stones[pos] == type) squares.push(pos);
        }
      }

      return squares;
    }
  }], [{
    key: "coordinate_to_square",
    value: function coordinate_to_square(coordinate) {
      var x = coordinate.charCodeAt(0) - "a".charCodeAt(0);
      var y = coordinate.charCodeAt(1) - "1".charCodeAt(0);
      return y * 7 + x;
    }
  }, {
    key: "square_to_coordinate",
    value: function square_to_coordinate(square) {
      var x = square % 7;
      var y = square / 7;
      return String.fromCharCode("a".charCodeAt(0) + x) + String.fromCharCode("1".charCodeAt(0) + y);
    }
  }]);

  return Board;
}();

exports.Board = Board;
},{"./move":"lib/move.ts"}],"main.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var board_1 = require("./lib/board");

console.log(board_1.Board);
var socket = io();
var new_game = document.querySelector('#create-a-game');
new_game.addEventListener('submit', function (event) {
  event.preventDefault();
  socket.emit('new_game');
});
var join_game = document.querySelector('#join-a-game');
var game_id = document.querySelector('#game-id');
join_game.addEventListener('submit', function (event) {
  event.preventDefault();
  socket.emit('join_game', game_id.value);
});
socket.on('chat', function (message) {
  console.log('From server: ', message);
});

function clicked(id) {
  var square = parseInt(id.charAt(1));
  var board = new board_1.Board();
  var squares = board.reachable_squares(board_1.Board.square_to_coordinate(square));
  squares.forEach(function (square) {
    document.getElementById("s" + square).className("white");
  });
}
},{"./lib/board":"lib/board.ts"}],"../../../../../../../usr/lib/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "45679" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../../usr/lib/node_modules/parcel/src/builtins/hmr-runtime.js","main.ts"], null)
//# sourceMappingURL=/main.c39d6dcf.js.map