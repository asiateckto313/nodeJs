const dotenv = require( 'dotenv' );
dotenv.config();
let admins_id = process.env.ADMINS_ID.split( '[' ).join( '' ).split( "]" ).join( '' );
admins_id = admins_id.split( ',' );
console.log ( admins_id )

module.exports = {
    token : process.env.TOKEN,
    admins_id : admins_id
}