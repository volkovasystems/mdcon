/*;
	@module-license:
		The MIT License (MIT)
		@mit-license

		Copyright (@c) 2017 Richeve Siodina Bebedor
		@email: richeve.bebedor@gmail.com

		Permission is hereby granted, free of charge, to any person obtaining a copy
		of this software and associated documentation files (the "Software"), to deal
		in the Software without restriction, including without limitation the rights
		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
		copies of the Software, and to permit persons to whom the Software is
		furnished to do so, subject to the following conditions:

		The above copyright notice and this permission notice shall be included in all
		copies or substantial portions of the Software.

		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
		SOFTWARE.
	@end-module-license

	@module-configuration:
		{
			"package": "mdcon",
			"path": "mdcon/mdcon.js",
			"file": "mdcon.js",
			"module": "mdcon",
			"author": "Richeve S. Bebedor",
			"eMail": "richeve.bebedor@gmail.com",
			"repository": "https://github.com/volkovasystems/mdcon.git",
			"test": "mdcon-test.js",
			"global": true
		}
	@end-module-configuration

	@module-documentation:
		Get list of mongo database connection address.
	@end-module-documentation

	@include:
		{
			"comex": "comex",
			"depher": "depher",
			"falzy": "falzy",
			"pedon": "pedon",
			"prid": "prid",
			"raze": "raze",
			"zelf": "zelf"
		}
	@end-include
*/

const comex = require( "comex" );
const depher = require( "depher" );
const falzy = require( "falzy" );
const pedon = require( "pedon" );
const prid = require( "prid" );
const raze = require( "raze" );
const zelf = require( "zelf" );

const mdcon = function mdcon( synchronous, option ){
	/*;
		@meta-configuration:
			{
				"synchronous": "boolean",
				"option": "option"
			}
		@end-meta-configuration
	*/

	let parameter = raze( arguments );

	synchronous = depher( parameter, BOOLEAN, false );

	option = depher( parameter, OBJECT, { } );

	var command = null;
	if( pedon.LINUX || pedon.OSX ){
		command = comex( "netstat -anp 2> /dev/null" )
			.pipe( "grep @pid" )
			.pipe( "grep tcp" )
			.pipe( "tr -s ' '" )
			.pipe( "xargs echo -n" )
			.pipe( "cut -d' ' -f4" )
			.defer( { } )
			.format( function connection( address ){
				if( falzy( address ) ){
					return null;
				}

				let [ host, port ] = address.split( ":" );

				return {
					"host": host,
					"port": port,
					"address": address
				};
			} );

	}else if( pedon.WINDOWS ){
		//: @todo: Please implement this!
		throw new Error( "platform not currently supported" );

	}else{
		throw new Error( "cannot determine platform, platform not supported" );
	}

	if( synchronous ){
		try{
			return prid( "mongod", true, option )
				.map( ( pid ) => command.clone( ).replace( "pid", pid ).execute( true, option ) );

		}catch( error ){
			throw new Error( `cannot get list of mongo database connection, ${ error.stack }` );
		}

	}else{
		let catcher = prid.bind( zelf( this ) )( "mongod", option )
			.then( function done( error, pid ){
				if( error ){
					return catcher.pass( new Error( `cannot get list of mongo database connection, ${ error.stack }` ), [ ] );

				}else{
					let length = pid.length;
					let connection = [ ];

					return pid.reduce( ( catcher, pid ) => {
						command.clone( ).replace( "pid", pid )
							.execute( option )( function done( error, address ){
								if( error ){
									command.stop( );

									return catcher.pass( new Error( `cannot get list of mongo database connection, ${ error.stack }` ), [ ] );

								}else{
									connection.push( address );

									if( connection.length == length ){
										return catcher.pass( null, connection );
									}

									return catcher;
								}
							} );

						return catcher;
					}, catcher );
				}
			} );

		return catcher;
	}
};

module.exports = mdcon;
