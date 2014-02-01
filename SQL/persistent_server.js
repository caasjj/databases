
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

app.get('/', function(request, response) {
  response.sendfile('index.html', { 'root': app.sourcePath + '/client'});
});

app.get(/^\/classes\/(rooms|messages)/, function(request, response){
  resource = request.url.split('/')[2];
  db.findResource(resource, function(errMsg) {
       send404(request, response, errMsg);
  }, function(data) {
      response.send(data);
    });
});

app.get(/^\/(room[0-9]+)/, function(request, response){
  resource = { name: 'rooms', select: { 'roomname': request.url.slice(1) } };
   db.findResource(resource, function(errMsg) {
       send404(request, response, errMsg);
  }, function(data) {
      console.log(data);
      response.send(data);
  } );
});

app.post(/^\/classes\/(rooms|messages)/, function(request, response){
  resource = request.url.split('/')[2];
  console.log('app.post: ', request.body);
  db.storeResource(resource, request.body, function(errMsg) {
       send404(request, response, errMsg);
  }, function(data) {
      response.send({objectId: data.insertId});
  });
});

app.post(/^\/(room[0-9]+)/, function(request, response){
  resource = { name: 'rooms', select: { 'roomname': request.url.slice(1) } };
  db.storeResource(resource, request.body, function(errMsg) {
    send404(request, response, errMsg);
  }, function(data) {
      response.send(data);
  });
});



