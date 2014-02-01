
var express = require('express');
var db = require('./db');

var app = express();
app.use(express.static('../client'));
app.use(express.bodyParser());
app.listen(8082);

var send404 = function(req, res, msg) {
  res.status(404).send(msg || 'Not found!');
};

app.sourcePath = '/Users/walid/Sites/Hackreactor/2014-01-databases';

// get home page
app.get('/', function(request, response) {
  response.sendfile('index.html', { 'root': app.sourcePath + '/client'});
});


// get details of a specific room
app.get('/rooms/:id', function(request, response){
  console.log('You want room with id', request.params.id);

  resource = { name: 'rooms', select: { 'id': request.params.id } };
  db.findResource(resource)
  .then(function(errMsg) {
   send404(request, response, errMsg);
 })
  .then( function(data) {
    console.log(data);
    response.send(data);
  });
});

// get messages for a specific room
app.get('/rooms/:id/messages', function(request, response){
  console.log('You want room with id', request.params.id);

  resource = { name: 'messages', select: { 'room_id': request.params.id } };

  db.findResource(resource)
  .then( function(data) {
    console.log(data);
    response.send(data);
  })
  .then( function(errMsg) {
   send404(request, response, errMsg);
 });
});


// get list of all messages
app.get(/^\/(rooms|messages)/, function(request, response){
  resource = request.url.slice(1);
  db.findResource(resource, function(errMsg) {
   send404(request, response, errMsg);
 }, function(data) {
  response.send(data);
});
});

// create a room
app.post('/rooms', function(request, response){
  resource = request.url.slice(1);
  console.log('app.post: ', request.body);
  db.storeResource(resource, request.body, function(errMsg) {
   send404(request, response, errMsg);
 }, function(data) {
  response.send({objectId: data.insertId});
});
});

// post a message
app.post('/messages', function(request, response){
  resource = { name: 'rooms', select: { 'roomname': request.url.slice(1) } };
  db.storeResource(resource, request.body, function(errMsg) {
    send404(request, response, errMsg);
  }, function(data) {
    response.send(data);
  });
});



