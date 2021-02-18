let fileUtils = require("./file"),
/*Message format 
{ userId : user_id, messages : [ { messageId : message_id, date: dateMessageWasSent } ] }
*/
saveMessage = function ( message_file , message) { 
   // On ne stocke que les id des messages afin de protéger le contenu de ces messages
    fileUtils.read_file( message_file )
    .then ( messagesParsed => {
        let messageObj  = { userId : message.from.id, messages : [ { message_id : message.message_id,
            date : message.date } ]
            }
            console.log (messageObj)

        if (  messagesParsed.length ) {
            //Existence d'au moins un user dans le fichier messages.txt
            // recherche des messages de l'utilsateur userId
            let userIdMessages = messagesParsed.filter ( message => message.userId === messageObj.userId );
            console.log ( "userIdMessages = ", userIdMessages )
            if ( ! userIdMessages.length ) {
                // L'utilisateur n'a pas encore envoyé de message au bot
                
                messagesParsed.push(messageObj)
        
            } else {
                //Sinon on l'ajoute
                console.log("SINON")
                userIdMessages[0].messages.push(  { message_id : message.message_id, date : message.date }  )

                console.log( " messagesParsed after push : ", messagesParsed )
            }

           
        } else {
            //Le fichier messages.txt est vide, première insertion
            console.log("Premiere insertion, message.txt")
            messagesParsed.push(messageObj)
            console.log("messagesParsed = ", messagesParsed[0].messages[0])
        }

        // Sauvegarde dans le fichier message.txt
        fileUtils.fs.writeFile ( message_file, JSON.stringify( messagesParsed ), ( err ) => {
            if ( err ) console.log("We've got an error : ", err)
            console.log('The message has been saved!');
        } )
    } )
};

module.exports = {
    saveMessage
}