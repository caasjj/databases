
var mysql = require('mysql');

var dbConnection = mysql.createConnection({
      user     : "tester",
      password : "test",
      database : "chat"
    });

dbConnection.connect(function(err) {
        if(err) {
          throw new Error('Cannot connect to database:', err);
        }
    });

var searchDb = function( table, select, err, cb ) {
  
  var queryString = 'SELECT * FROM ?? ';
  var inserts = [ table ];
  var keys = (typeof select === 'object') && Object.keys(select);
  
  if ( keys.length  > 1 ) {
      err('"searchDb->db.findResource(table, select, err, cb): "select" must be {} or have single property.');
  }
  if ( keys.length ) {
    inserts = inserts.concat(keys[0], [ select[ keys[0] ]]);
    queryString += 'WHERE ?? = ?';
  }
  queryString = mysql.format( queryString, inserts );
  //console.log(queryString);
  dbConnection.query(queryString, function(error, data) {
    if (error) {
      err( error );
    } else {
      cb( data );
    }
  });
};

var storeToDb = function(table, data, err, cb) {
  var queryString = 'INSERT into ' + table + ' SET ?';
  dbConnection.query( queryString, data, function(error, result) {
      if (error) {
        console.log( ' POST ERROR !!');
      } else {
        console.log('POST Complete: ', result);
      }
  });
};

var validateReadRequest = function(resource, err, cb) {
  var params = {};
  if (typeof err !== 'function' || typeof cb !== 'function') {
    throw new Error('db.validateRequest(resource, err, cb): err, cb must be callable.\n');
  }
  if (typeof resource === 'string' ) {
    if (['rooms', 'messages', 'users'].indexOf(resource) < 0) {
      err('db.validateRequest(resource, err, cb): string "resource" must be "messages"|"rooms"|"users"\n');
    }
    params.name = resource;
    params.select = {};
  } else {
    var p = Object.keys( resource );
    //console.log(resource);
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

exports.findResource = function(resource, err, cb) {
  var params = validateReadRequest(resource, err, cb);
  searchDb( params.name, params.select, err, cb);
};

exports.storeResource = function(resource, data, err, cb) {
  console.log('Storing ', data, 'to resource', resource + '\n');
  storeToDb( resource, data, err, cb);
};



