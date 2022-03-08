var connection;
var Sequelize;
Sequelize = require('sequelize');
connection = new Sequelize('spotifyTracks', 'root', 'admin123', {
  dialect: 'mysql'
})
module.exports = {connection,Sequelize};