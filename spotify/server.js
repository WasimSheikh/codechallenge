const express = require('express');
// var Sequelize = require('sequelize');
var SpotifyWebApi = require('spotify-web-api-node');
// var connection = new Sequelize('spotifyTracks', 'root', 'admin123', {
//   dialect: 'mysql'
// })
const   {connection,Sequelize} = require('./connection');
const  { TracksDao, ArtistsDao } = require('../models/artists');

const app = express();
const port = 8002;

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: '6dae0a0a5fa14c6094020e079b00904b',
  clientSecret: 'cf8380f02172434882431fafe1b67044'
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then(
  function (data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function (err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);


// const TracksDao = connection.define('tracks', {
//   title: Sequelize.STRING,
//   spotifyImageUrl: Sequelize.TEXT,
//   isrc: {
//     type: Sequelize.STRING,
//     unique: true
//   },
//   metadata: Sequelize.JSON
// });
// const ArtistsDao = connection.define('artists', {
//   name: Sequelize.STRING,

// });

// ArtistsDao.belongsTo(TracksDao, { as: 'TrackRef', foreignKey: 'trackId' });

connection
  .authenticate()
  .then(() => {
    console.log('connection has been  established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database: ', err);
  });

  connection
  .sync({
    logging: console.log,
    force: false
  })
  .then(() => {
    console.log('Connection to database established successfully.');
    app.listen(port, () => {
      console.log('Running server on port ' + port);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

 app.get('/tracks',  (req, res) => {
  const isrc = req.query.isrc;
  if (!isrc) {
    res.status(400);
    res.json(
      {
        errorMessage: "Missing required parameter."
      }
    )
    return;
  }
  spotifyApi.searchTracks(`isrc:${isrc}`)
    //spotifyApi.searchTracks(`love`)
    .then(function (data) {
      console.log(data);
      if (data?.body?.tracks?.items?.length <= 0) {
        res.status(404);
        res.json(
          {
            errorMessage: "ISRC not found in Spotify."
          }
        )
        return;
      }
      let results = data.body;
      let track = results.tracks;
      let popular = track.items.sort((a, b) => b.popularity - a.popularity)[0];

       TracksDao.create({
        trackId: popular.id, //string
        title: popular.name,
        isrc: popular.external_ids.isrc,
        metadata: popular

      })
        .then((rec) => {
          let artitstsAry = popular.artists.map((ele) => {
            return {
              name: ele.name,
              trackId: rec.dataValues.id
            }
          });
           ArtistsDao.bulkCreate(artitstsAry)
            .then(() => {
              res.status(201);
              res.json({
                status: "Sucess"
              })
              return;
            })
            .catch(error => {
              console.log(error);
            })

        })
        .catch(error => {
          if (error.name === "SequelizeUniqueConstraintError") {
            res.status(400).send;
            res.json({
              errorMessage: "Duplicate ISRC code found."
            })
            return;
          }
          console.log(error);
        })
      // res.json(popular);
    }, function (err) {
      console.error(err);
    });
});

app.get('/track-isrc', (req, res) => {
  TracksDao.findOne({
    where: { isrc: req.query.isrc }
  })
    .then(track => {
      res.json(track);
    })
    .catch(error => {
      console.log(error);
      res.status(404).send(error);
    })
})
app.get('/track-artist', (req, res) => {
  ArtistsDao.findAll({
    where: { name: { [Sequelize.Op.like]: `%${req.query.name}%` } },
    include: [{ model: TracksDao, as: 'TrackRef' }]
  })
    .then(artist => {
      res.json(artist);
    })
    .catch(error => {
      console.log(error);
      res.status(404).send(error);
    })
})

