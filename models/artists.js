const {connection,Sequelize} = require('../spotify/connection');
var TracksDao;
var ArtistsDao;

TracksDao = connection.define('tracks', {
  title: Sequelize.STRING,
  spotifyImageUrl: Sequelize.TEXT,
  isrc: {
    type: Sequelize.STRING,
    unique: true
  },
  metadata: Sequelize.JSON
});

ArtistsDao = connection.define('artists', {
  name: Sequelize.STRING,
});
ArtistsDao.belongsTo(TracksDao, { as: 'TrackRef', foreignKey: 'trackId' });
module.exports = {ArtistsDao,TracksDao}