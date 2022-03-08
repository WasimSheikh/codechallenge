
exports.TracksDao = connection.define('tracks', {
    title: Sequelize.STRING,
    spotifyImageUrl: Sequelize.TEXT,
    isrc: {
      type: Sequelize.STRING,
      unique: true
    },
    metadata: Sequelize.JSON
  });

