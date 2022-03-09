const express = require('express');
const { connection, Sequelize } = require('./connection');
const { TracksDao, ArtistsDao } = require('./models');
const { createTrack, findTracksByIsrc, findTracksByArtist } = require('./services/trackServices')
const { isEmpty, missingParamError } = require('./utils')

const app = express();
const port = 8002;
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

app.get('/tracks/sync', (req, res) => {
  const isrc = req.query.isrc;
  return (isEmpty(isrc) ? missingParamError(res) : createTrack(isrc, res));
});

app.get('/tracks/isrc', (req, res) => {
  const isrc = req.query.isrc;
  return (isEmpty(isrc) ? missingParamError(res) : findTracksByIsrc(isrc, res));
})
app.get('/tracks/artist/:name', (req, res) => {
  const name = req.params['name'];
  return (isEmpty(name) ? missingParamError(res) : findTracksByArtist(name, res));
})

process.on('uncaughtException',function(err){
  console.log('error=' + err);
})
