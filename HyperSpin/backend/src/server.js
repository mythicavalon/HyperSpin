/*
 Server bootstrap: loads Express app and starts HTTP server
*/

const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 8080;

async function start() {
  try {
    await sequelize.sync();
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`HyperSpin backend listening on :${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();