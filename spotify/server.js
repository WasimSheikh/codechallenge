const express = require('express');
const Sequelize = require('sequelize');
var SpotifyWebApi = require('spotify-web-api-node');
//const Data = require('./data');
const app = express();
const port = 8001;


// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: '6dae0a0a5fa14c6094020e079b00904b',
  clientSecret: 'cf8380f02172434882431fafe1b67044'
});

// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then(
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);


const connection = new Sequelize('spotifyTracks', 'root', 'admin123', {
  dialect: 'mysql'
})

const Tracks = connection.define('Tracks',{
  name:Sequelize.STRING
});

app.get('/tracks',(req,res)=>{
  spotifyApi.searchTracks(`isrc:${req.query.ISRC}`)
  //spotifyApi.searchTracks(`love`)
  .then(function(data) {
    res.json(data.body);
    console.log('Search by "QMEU31910213"', req);
  }, function(err) {
    console.error(err);
  });

  // spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
  //   function(data) {
  //     res.json(data.body);
  //     console.log('Artist albums', data.body);
  //   },
  //   function(err) {
  //     console.error(err);
  //   }
  // );

 // Tracks.findAll().then(t=>res.json(t)).catch(error=> {console.log(error);res.status(404).send(error)});
});

var bodyParser = require('body-parser');
app.use(bodyParser.json());

// for routes looking like this `/products?page=1&pageSize=50`
app.get('/create', function(req, res) {
  const page = req.query.ISRC;
  res.send(`Filter with parameters ${page}`);
});


connection
  .authenticate()
  .then(() => {
    console.log('Connection has been  established successfully.');
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

 

