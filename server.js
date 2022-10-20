const http = require("http");

const app = require("./app.js");

//Create a port where server will serve/run
const port = process.env.PORT || 3000;

//Create a server
const server = http.createServer(app);

//Listen/Start server
server.listen(port);
