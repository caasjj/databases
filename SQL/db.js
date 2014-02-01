
var mysql = require('mysql');
var Q = require('q');

var dbConnection = mysql.createConnection({
      user     : "tester",
      password : "test",
      database : "chat-split"
    });

dbConnection.connect(function(err) {
  if(err) {
    throw new Error('Cannot connect to database:', err);
  }
});

var searchDb = function( table, select, cb ) {
  var queryString = 'SELECT * FROM ?? ';
  var inserts = [ table ];
  var keys = (typeof select === 'object') && Object.keys(select);
  
  if ( keys.length  > 1 ) {
      err('"searchDb->db.findResource(resource, err, cb)": "select" must be {} or have single property.');
  }
  if ( keys.length ) {
    inserts = inserts.concat(keys[0], [ select[ keys[0] ]]);
    queryString += 'WHERE ?? = ?';
  }
  queryString = mysql.format( queryString, inserts );
  dbConnection.query(queryString, cb) ; 
};

var storeToDb = function(table, data, err, cb) {
  var queryString = 'INSERT into ' + table + ' SET ?';
  dbConnection.query( queryString, data, function(error, result) {
      if (error) {
        err('"storeToDb->db.storeResource(resource, data, err, cb)": "write failed"\n');
      } else {
        cb( result );
      }
  });
};

var validateReadRequest = function(resource) {
  var params = {};

  if (typeof resource === 'string' ) {
    if (['rooms', 'messages', 'users'].indexOf(resource) < 0) {
      err('db.validateRequest(resource, err, cb): string "resource" must be "messages"|"rooms"|"users"\n');
    }
    params.name = resource;
    params.select = {};
  } else {
    var p = Object.keys( resource );
    if( (p.length !== 2) || !resource.hasOwnProperty('name') || !resource.hasOwnProperty('select') ) {
      err('db.validateRequest(resource, err, cb): Object "resource" must have string "name" and object "select" parameters\n' );
    }
    if (['rooms', 'messages', 'users'].indexOf(resource.name) < 0) {
      err('db.validateRequest(resource, err, cb): string "resource.name" must be "messages"|"rooms"|"users"\n');
    }
    params = resource;
  }
  return params;
};

exports.findResource = function(resource) {
  var deferred = Q.defer();
  var params = validateReadRequest(resource);
  searchDb( params.name, params.select, function(err, data) {
      if (err) {
        deferred.reject( err );
      } else {
        deferred.resolve(data);
      }
    });
  return deferred.promise;
};

exports.storeResource = function(resource, data, err, cb) {
  console.log('Storing ', data, 'to resource', resource + '\n');
  storeToDb( resource, data, err, cb);
};



