table 	 = ['messages'];
joins    = ['rooms', 'users']; // ['rooms', 'users'];
selector = {'room_id' : [1] }


queryString = 'SELECT * from ' +  table.concat(joins).join(',');
if (joins.length) {
 table_join_ids = joins.map( function(j) { return table[0]+'.'+j.slice(0,j.length-1)+'_id'} );
 join_ids = joins.map( function(j) { return j + '.id'} );

 console.log( join_ids );
 queryString += ' WHERE (' + table_join_ids.join(',') + ') = (' +  join_ids.join(',') + ')';
}
if (selector && Object.keys(selector).length) {
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

console.log( queryString );
