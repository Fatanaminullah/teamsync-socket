var Turn = require('node-turn');
var server = new Turn({
  // set options
  authMech: 'long-term',
  credentials: {
    username: "password"
  },
  debugLevel : "ALL"
});

server.start()