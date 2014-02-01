
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

var searchRelation = exports.searchRelation = function(table, joins, selector) {
  var deferred = Q.defer();
  var queryString = 'SELECT * FROM ?? ';
  
  joins = Array.isArray(joins) ? joins : (joins ? [joins] : []);
  table = Array.isArray(table) ? table : [table];
  console.log('Tble: ', table, 'Joins: ', joins);
  queryString = 'SELECT * from ' +  table.concat(joins).join(',');
 // console.log(queryString);
  if (joins && joins.length > 0) {
    console.log(joins);
    table_join_ids = joins.map( function(j) { return table[0]+'.'+j.slice(0,j.length-1)+'_id'} );
    join_ids = joins.map( function(j) { return j + '.id'} );
    queryString += ' WHERE (' + table_join_ids.join(',') + ') = (' +  join_ids.join(',') + ')';
  }
  if (selector && Object.keys(selector).length > 0) {
    //console.log('Selector: ', selector);
    for( p in selector) {
      if (selector[p].length) {
        if (joins.length) {
          queryString += ' AND ';
         } else {
           queryString += ' WHERE ';
         }
        queryString += p + ' IN ' + '(' + selector[p].join(',') + ')';
      }  
    }
  }
  queryString += ';';
  //console.log(queryString);
  dbConnection.query(queryString, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  }) ; 
  return deferred.promise;
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

var storeResource = exports.storeResource = function(resource, data, err, cb) {
  //console.log('Storing ', data, 'to resource', resource + '\n');
  storeToDb( resource, data, err, cb);
};



