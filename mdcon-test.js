
const mdcon = require( "./mdcon.js" );

console.log( mdcon( true ) );

mdcon( )( function done( ){
	console.log( arguments );
} );
