const Sequelize = require('sequelize');
const connection = new Sequelize('spotifyTracks', 'root', 'admin123', {
  dialect: 'mysql'
})
module.exports = {connection,Sequelize};