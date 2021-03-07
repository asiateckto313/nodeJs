//TODO try to think about reminder feature, if the todos added take a long time to be checked, send a message or a notification
//TODO really later think about add a due date for a todo to get reminded
const path = require('path');
const { token, mode, admins_id } = require('../config/envparam');
const en_EN = require('../langs/en_EN');
const { getUserLang, addUserTodo, read_file, saveTodo, getUserTodos } = require('./file');
const { makeGestRequest } = require('./request');
const mediaTimeOut = 1000 * 60 * 7;

const todo_file = path.resolve('./todos.txt');

let inlineKeyboard = {
    inline_keyboard: [
        [
            {
                text: 'Help',
                callback_data: '/help'
            }
            
        ],
        [
            {
                text: 'Add',
                callback_data: '/add'
            },
            {
                text: 'Get',
                callback_data: '/get'
            }
            
        ],
        [
            {
                text: 'Check',
                callback_data: '/check'
            },{
                text: 'Remove',
                callback_data: '/remove'
            }
        ],[
            {
                text: 'Reset',
                callback_data: '/reset'
            }
        ],[
            {
                text: 'Set bot language',
                callback_data: '/set_bot_lang'
            }
        ]
    ]
}, reset_option = {
    inline_keyboard:[
        [{
            text:"My to do list",
            callback_data: '/reset todolist'
        }],[
            {
                text:"My checked list",
                callback_data: '/reset checklist'
            }
        ]
    ]
};

try {
    let fileUtils = require( " ./file" ) ,
    telegram = require('telegram-bot-api'),
    api = new telegram({
        token : token ||'token_ID',
        updates : {
            enabled : true,
            get_interval : 1000
        }
    }),
    
    whichCommand = function ( message ) {
        let command = undefined, instruction = undefined, tmp = "",
            url = `https://api.telegram.org/bot${token}/getMyCommands`,
            adminsIds = admins_id;
        try {
            let publishCommand = message.text.split('/publish');

            if ( publishCommand.length > 1 ) {

                instruction = publishCommand[1].trim()
                // On vérifie si c'est un admin qui a envoyé la commande

                let verification = adminsIds.filter( id => parseInt (message.from.id )  === parseInt ( id ) || parseInt ( message.chat.id ) === parseInt ( id ) )

                if ( verification.length ) {
                    //Alors c'est bien un admin qui a envoyé cette commande, on 
                    //envoie à tous les souscripteurs excepté l'admin
                    read_file(todo_file)

                    .then ( bdContend => {
                        bdContend.map( user => {
                            if ( user.chat_id !== message.from.id ) {
                                //On envoie le message à toute personne différente
                                // de celle qui a envoyé la commande si elle est admin
                                api.sendMessage( {
                                    chat_id : user.chat_id,
                                    text : instruction,
                                    parse_mode : 'Markdown'
                                } )
                                .then( success => {
                                    // console.log( "  success  = ", success)
                                    console.log( "  ✅ Message sent to all of subscribers " ) 
                                } )
                                .catch (err => {
                                    console.log( " sendMessage error : ", err)
                                } )
                            }
                        } )
                        console.log( " Message sent to all of the subscribers" ) 
                    })
                    .catch ( err => {
                        sendMsg(message.from.id, 'An error occurs')
                        console.log( " read_file whichCommand error : ", err)
                    })
                    // return
                }
            }
            command = message.text.trim().split('/').slice(1)[0].split(' ')[0],
            instruction = message.text.trim().split('/').slice(1)[0].split(' ');
            // console.log(command) // vérification préalable de l'existence d'une instruction
            for( let i = 1; i < instruction.length; i++ )
                tmp += instruction[ i ] + " "
            tmp = tmp.trim();

                if (mode.toLowerCase() === "prod" ||
                mode.toLowerCase() === "production" ) {
                    //  feature available on production mode only
                    makeGestRequest(url)
                    .then( response => {
                        commandBotLists = response.result
                        let verification = commandBotLists.filter (commandsBot => commandsBot.command === command)
                        // console.log ( " verification = ", verification)
                        if ( ! verification.length ) {
                            //La commande envoyée ne fait pas partie des commandes du bot
                            api.deleteMessage( {
                                //On la supprime
                                chat_id : message.chat.id || message.from.id,
                                message_id : message.message_id 
                            })
                            .then (response => {
                                console.log ( " Message deleted ✅" ) 
                            })
                            .catch (err => {
                                console.log ( " whichCommand deleteMessage error : ", err.error)
                            })
                        }
                    })
                    .catch ( err => {
                    console.log( " whichCommand get error : ", err)
                })
                }
            if (  ! tmp ) { // La commande n'est pas suivie d'une instruction
                // console.log( " ICi" ) 
                //Case of help or get command
                
                return { error : false , "data": { "command" : command } }
                
            } else {
                
               

                //Case of add , remove or check
                return { error : false , data : { "command" : command , "instruction" : tmp } }
            }
                
        } catch ( e ) { // La commande a été envoyé par le biais des boutons
            console.log( "Dans le catch" )

            try {
               
               
            if ( message.data.split(' ').length == 1) command = message.data.split(' ')[0].trim().split('/')[1].toLowerCase()
            
            if ( message.data.split(' ').length == 2) {
                command = message.data.split(' ')[0].trim().split('/')[1]
                instruction = message.data.split(' ')[1]
                
            }

            return { error : false , "data" : { "command" : command , "instruction" : instruction } }

        } catch ( f ) {
                return { error : true, error_msg : f }
            }            
        }
    },
    
    welcome_command = function( userId , username = undefined ) {
        sendMsg( userId , "Hello @"+ username+" and thank you for using my bot. Let me know if any problem occurs because it's my first bot. Hope you will enjoy." )
    },
    
    help_command = function(chatId){
        
        let msg = "Welcome to the ToDolistBot. This bot helps you manage and track your todos."+
        "You can add new todo or get the list of your todos.\n\n\t*Adding a new todo :*\n\tThe following example will show you how to do it, add 'foo' as a todo : \n\t/add foo\n\n\t" +
        "*Listing your todos*\n\t To get the list of your todos, you just have to  do as the following example : \n\t/get\n\n\t" +
        "*NOTE you just have to send /get without anything after.*\n\n\t" +
        "*Checking a todo*\n\t To check a todo (make it as completed) :\n\t1. First, send a /get to have the list of your todos\n\t2. Then use the /check and the index of the todo to check (Example : /check 2)\n\n\t"+
        "*Removing a todo*\n\t As the /check command specify the index of the todo to remove. If you want to remove the 2nd todo of your list you can do the following:\n\t /remove 2\n\n\t"+
        "*Resetting a list*\n\tTo reset a list which can either be the checked list or the todos one you can do it by following this syntax :\n\t"+
        "1. /reset todo (will reset, delete all of your todos)\n\t2. /reset check (will reset, delete all your todos checked)\n\n\t"+
        "*Please note :* If you have at least checked a todo to have the list of your todos checked, send /get\n\n\t*Show command buttons*\n\n\t"+
        "Send the /commands to see the same syntax in a designed buttons.\n\n\tPlease if any errors occurs let me know @superPablo_E. Thank you in advance and enjoy."
        //sendMsg(chatId,msg,'Markdown')
        api.sendMessage({chat_id:chatId,
        text:msg
        //parse_mode: 'Markdown'
    })
       
    },

    change_language_preference = async function(userId,lang,todo_file){
        try {
            let datas = await fileUtils.read_file(todo_file), taille = datas.length;
            console.log( " datas : ",datas)
            for(let i = 0; i< taille; i++)
            if ( datas [ i ].chat_id == userId){
                datas [ i ].lang = lang
                fileUtils.saveTodo(datas)
                console.log( " change_language_preference invoked" ) 
                return;
            }
        } catch (error) {
           console.error( " change_language_preference error : ",error) 
        }
    
    },
    
    add_command = function(todolist,userId,todo,user_lang){
        console.log( " todo = ",todo)
        fileUtils.addUserTodo(userId,user_lang,todo,todo_file)
    },

    serialize_msg = function( array ) {
        let message = ""
            if ( array.todos ) {
                console.log ( " todos" ) 

                for( let i = 0; i < array.todos.length; i++ )
                    message += "🕒: "+(i+1) + " - " +array.todos[ i ]+"\n"
    
            }
            if ( array.todos_checked ) {
                console.log ( " todos_checked" ) 
                if ( array.todos_checked.length ) {  
                    message += en_EN.serialize_msg_checklist_text
                
                    for( let i = 0; i < array.todos_checked.length; i++ )
                        message += "✅: "+ (i+1) + " - " +array.todos_checked[ i ]+"\n"
                }
            }

            console.log( " todo.serialize_msg invoked" ) 
        return message
    },
    
    get_command =  function( todolist , checkedList , userId){
        let msg = "";
        return new Promise((resolve, reject) => {
            read_file( todo_file )
            .then ( bdContent => {
                let user = bdContent.filter ( users => users.chat_id === userId)
                if ( user[ 0 ].todos && user[ 0 ].todos.length ) {
                    // L'utilisateur a au moins un todo
                    msg += en_EN.serialize_msg_todolist_text + serialize_msg( user[ 0 ] )
                } else {
                    //L'utilisateur n'a peut être pas de todos mais check tous ses todo
                    if ( ! user[ 0 ].todos.length && user[ 0 ].todos_checked 
                        && user [ 0 ].todos_checked.length ) {
                           // L'utilisateur a check tous ses todos, on réinitialise sa checkedList
                           reset(userId, false) // false because 
                           //et on l'encourage à terminer toutes ses tâches en lui envoyant une photo
                           api.sendPhoto(
                               {
                                   chat_id : userId,
                                   caption : "🥳 CONGRATULATIONS YOU'VE CHECKED ALL YOUR TODOS 🤩",
                                   photo :  'AgACAgQAAxkDAAIH-mAyNqyaKnJ0OfuOdx5zb2QkeOiiAAKCtTEbd3KQUV5qMd9Wza03qGcaJ10AAwEAAwIAA3kAA5luBQABHgQ' || 
                                            path.resolve( "./public/assets/img/congratulations.jpg" ) 
                               }
                           ) .then( response => {
                               console.log ( "congratulation photo sent ✅ " ) 
                           }) .catch ( err => {
                               console.log ( " sendPhoto error : ", err.error)
                           })
                           api.sendAudio({
                               chat_id : userId,

                               audio : 'CQACAgQAAxkDAAIH-2AyNrL2L-gLqeHvebey8Rp8VVioAAIJCAACd3KQUZsB3DTRkgZ9HgQ' || path.resolve( " ./public/assets/audio/celebration.mp3" ) 
                           }).then( response => {
                            console.log ( "sendAudio response = ", response)
                            }) .catch ( err => {
                                console.log ( " sendAudio error : ", err.error)
                            })
                    } else {
                        //Aucun todo ni todo checked
                        msg = en_EN.check_empty_text
                    }
                }

                (msg !== '') ? sendMsg( userId , msg ) : ''


            } ) .catch ( e => {
                reject ( e )
            })
        console.log( " get_command invoked" ) 
        
        });
        
    },
    remove_command =  function( userId, todolist, todoIndex ) {
        let tailleTodoList = todolist.length
        console.log( todolist )
        if ( tailleTodoList ) {
            
            todoIndex = parseInt(todoIndex)
            if ( isNaN(todoIndex) ) sendMsg( userId, "Invalid index" )
            if (  todoIndex <= 0 ) sendMsg( userId, "Can not remove empty todos" )
            else {

                if ( todoIndex > tailleTodoList ) { sendMsg(userId,"Invalid index" )  ; return }
                todolist.splice( todoIndex-1, 1 )

                getUserLang( userId, todo_file )
                .then ( user_lang => {

                    addUserTodo( userId, user_lang.data , todolist, todo_file)
                    .then ( response => {
                        sendMsg(userId,"Todo removed 👍" )   
                    } )
                    .catch ( err => {
                        console.log ( "err = ", err)
                    } )
                } )
                .catch( err2 => {
                    console.log ( "err2 = ", err2 )
                } )

                
            }
                    
        }else{
            sendMsg(userId,"Can not remove empty todo list. Please add at least one before removing it" ) 
        }
    
    },
    
    isTheRightSyntax = function(message){
        //De base on suppose que c'est la bonne syntaxe
        let yesItis = true, result = whichCommand(message);
        console.log( " result = ",result)
        let command = result.data?.command, instruction = result.data.instruction;
        command = command.toLowerCase()

        
        
        if ( instruction ) { // L'utilisateur entre du texte après avoir écrit ces commandes
            if ( command == 'help' || command == 'get' || command == 'start')
            yesItis = false
    
        }else{ // L'utilisateur n'entre rien
            if ( command == 'add' || command == 'remove' || command == 'check'|| command === "publish" )  
            yesItis = false;
        }
        return yesItis
    }, 
    
    sendMsg = function(chatId, text,mode=undefined){
        //console.log( " mode = ",mode)
        if ( mode)
            api.sendMessage({
                chat_id:chatId,
                text: text,
                
            },{parse_mode:mode})
        else
        api.sendMessage({
            chat_id:chatId,
            text: text
        })
    },
    verifyIndex = function(index,array,userId){
        // console.log( " index =",index)
        let tailleArray = array.length
        if ( isNaN(parseInt(index.trim()))) return false;
        else if (index <= 0 ) return false;
        else{
            if ( tailleArray){ // at least one item
                if ( index > tailleArray ) return false
                console.log( " verifINDEX HERE" ) 
                for(let i = 0; i < tailleArray; i ++)
                    if ( array[i].chat_id == userId){
                       if (index > array[i].todos.length) return false
                    }
                
            }else{ //empty
                if ( index < tailleArray) return false
                if ( index > tailleArray) return false
            }
        }
        return true
        
    },
    
    check_command = function( todoIndex, todolist, checkedList, userId ) {
        console.log( " userid = ",userId)
        let tailleTodoList = todolist.length, tailleCheckedList = checkedList.length
       if ( verifyIndex( todoIndex, todolist, userId ) ) {
           //L'index entré est validé nous allons d'abord récupérer le todo
           let todo_to_check = undefined;
           todo_to_check = todolist[ todoIndex -1 ]

            if ( todo_to_check !== undefined ) {
                if ( tailleCheckedList ) {
                    //Bd (table checkedList non vide)
                    let found = false;
                    console.log( " Bd non vide" ) 
                    //Nous allons effectuer une recherche pour savoir si l'utilisateur s'y trouve
                    for(let i = 0; i < tailleCheckedList ; i ++){
                        if ( checkedList[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                            checkedList[i].todos_checked.push(todo_to_check)
                            remove_command(userId,todolist,todoIndex)

                            found = true
                            break;
                        }
                    }
                    if ( !found ) {// Si l'utilisateur n'y figure pas alors c'est son premier ajout
                    checkedList.push({chat_id:userId,todos_checked:[todo_to_check]})
                    remove_command(userId,todolist,todoIndex)

                }
                }else{
                    checkedList.push({chat_id:userId, todos_checked:[todo_to_check]})
                    remove_command(userId,todolist,todoIndex)

                    console.log( " Bd vide, premier ajout" ) 
                }
            }
            
            console.log( " checkedList : ",checkedList)
            read_file ( todo_file )
            .then ( bdContend => {
                // console.log ( " bdContend = ", bdContend)
                let userCheckedLists = bdContend.filter (user => userId === user.chat_id);
                if ( userCheckedLists[ 0 ].todos_checked && userCheckedLists[ 0 ].todos_checked.length )
                   userCheckedLists[ 0 ].todos_checked =  userCheckedLists[ 0 ].todos_checked.concat(checkedList[ 0 ].todos_checked)
                else 
                    userCheckedLists[ 0 ].todos_checked = checkedList[ 0 ].todos_checked
                console.log ( " userCheckedLists[ 0 ] = ", userCheckedLists[ 0 ])

                saveTodo( bdContend )

            })
            .catch ( err => {
                sendMsg( userId, "Something went wrong with this command, we are fixing it. \nDon't forget to text me if this error occurs one more time : @superPablo_E" ) 
                console.log( "check_command read_file error : ", err)
            } )
            sendMsg(userId, "Added to the checked list. We are removing your todo" ) 

            return;
                
                    
        }
       else
            sendMsg(userId,"Invalid Index" ) 
        return;


     
    },
    reset = function(userId,todolist_or_checkList){
        // L'on va procéder par un bool pour savoir si l'on souhaite réinitialiser la todo list ou la checkedList
        try{
           if (typeof todolist_or_checkList === "boolean" )  {
            read_file( todo_file )
            .then ( bdContent => {
                
                // User wants to reset his todo list
                let userTodo = bdContent.filter (user => user.chat_id === userId)
                todolist_or_checkList ? userTodo[0].todos = [] : userTodo[0].todos_checked = []
                saveTodo(bdContent)
                todolist_or_checkList ? sendMsg( userId,'✅ Your todo list has been reset' ) : sendMsg( userId,'✅ Your checked list has been reset' )
                // sendMsg( userId,'😅' )        
            })
            .catch (err => {
                console.log ( "reset read_file error : ", err)
            })
           }
            
                
        }catch(e){
            console.log( " Error occurs : ",e)
            sendMsg(userId,"Sorry an internal error occurs, we're  fixing it" ) 
            sendMsg(440227163,"An error occurs : "+e)
        }
    },
    sendMessage_with_inlineKey = function(userId,msg,inline){
        api.sendMessage({chat_id:userId,
            text:msg,
            reply_markup:JSON.stringify(inline),
            parse_mode: 'Markdown'
            })
    };
    
   
    module.exports = {
        api,
        whichCommand,
        add_command,
        get_command,
        remove_command,
        sendMsg,
        serialize_msg,
        isTheRightSyntax,
        welcome_command,
        check_command,
        verifyIndex,
        reset,
        help_command,
        sendMessage_with_inlineKey,
        change_language_preference,
        inlineKeyboard,
        reset_option
        
    }
    
   
   
} catch (error) {
    console.log( " An error occurs" ) 
}
