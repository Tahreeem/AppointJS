// mongoimport --host localhost --db bookings --collection secret --file ServiceAccountKey.json

// var spawn = require('child_process').spawn;

//this didn't work for migrating file to mlab but may want to investigate later
// var mongoImport = spawn('mongoimport', [
//     '--host', 'localhost', '--db', 'bookings', '--collection', 'secret', '--file', '../ServiceAccountKey.json'
// ]);
// mongoImport.stderr.on('data', function (data) {
//     if (data) {
//         console.log(data = data.toString());
//     } else {
//         console.log('import failed');
//     }
// });

//------------------------------------------------------------------------

//convenience for local machine exporting service account json to mongo
// var mongoExport = spawn('mongoexport', [
//     '--db', 'bookings', '--collection', 'secret',
//     '--jsonArray', '--pretty'
// ]);
// mongoExport.stdout.on('data', function (data) {
//     if (data) {
//         data = data.toString();
//         data = JSON.parse(data);
//         console.log(data[0]);
//     } else {
//         console.log('export failed');
//     }
// });