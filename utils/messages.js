const { whichCommand, api } = require("./todo");

let fileUtils = require("./file"),
/*Message format 
{ userId : user_id, messages : [ { messageId : message_id, date: dateMessageWasSent } ] }
*/
saveMessage = function ( message_file , message) { 
   // On ne stocke que les id des messages afin de protéger le contenu de ces messages
   let result = whichCommand (message)
   if ( result.error ) {
       //Le message envoyé n'est pas une commande bot
       //Alors on l'efface et ne le stocke pas
       api.deleteMessage( {
           chat_id : message.chat.id ,
           message_id : message.message_id 
       } , (err , result) => {
           if ( err ) { 
               console.log( "Error while deleting " , err )
               return
           }
           console.log( result, " Message deleted ✅" )
       })
       return
   }
    fileUtils.read_file( message_file )
    .then ( messagesParsed => {
        let messageObj  = { userId : message.from.id, messages : [ { message_id : message.message_id,
            date : message.date } ]
            }

        if (  messagesParsed.length ) {
            //Existence d'au moins un user dans le fichier messages.txt
            // recherche des messages de l'utilsateur userId
            let userIdMessages = messagesParsed.filter ( message => message.userId === messageObj.userId );

            if ( ! userIdMessages.length ) {
                // L'utilisateur n'a pas encore envoyé de message au bot
                
                messagesParsed.push(messageObj)
        
            } else {
                //Sinon on l'ajoute
                userIdMessages[0].messages.push(  { message_id : message.message_id, date : message.date }  )
            }

           
        } else {
            //Le fichier messages.txt est vide, première insertion
            messagesParsed.push(messageObj)
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