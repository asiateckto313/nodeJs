//TODO try to think about reminder feature, if the todos added take a long time to be checked, send a message or a notification
//TODO really later think about add a due date for a todo to get reminded
const path = require('path');
const { token } = require('../config/envparam');
const en_EN = require('../langs/en_EN');

const todo_file = path.resolve('./todos.txt');

try {
    let fileUtils = require("./file"),
    telegram = require('telegram-bot-api'),
    api = new telegram({
        token : token ||'token_ID',
        updates : {
            enabled : true,
            get_interval : 1000
        }
    }),
    
    whichCommand = function ( message ) {
        let command = undefined, instruction = undefined, tmp = "";
        try {
            command = message.text.trim().split('/').slice(1)[0].split(' ')[0],
            instruction = message.text.trim().split('/').slice(1)[0].split(' ');
            // console.log(instruction) // vérification préalable de l'existence d'une instruction
            for( let i = 1; i < instruction.length; i++ )
                tmp += instruction[ i ] + " "
            tmp = tmp.trim();

            if (  ! tmp ) { // La commande n'est pas suivie d'une instruction
                // console.log("ICi")
                //Case of help or get command
                return { error : false , "data": { "command" : command } }
                
            } else {
                //Case of add , remove or check
                // console.log("LA")
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
            console.log("datas : ",datas)
            for(let i = 0; i< taille; i++)
            if ( datas[i].chat_id == userId){
                datas[i].lang = lang
                fileUtils.saveTodo(datas)
                console.log("change_language_preference invoked")
                return;
            }
        } catch (error) {
           console.error("change_language_preference error : ",error) 
        }
    
    },
    
    add_command = function(todolist,userId,todo,user_lang){
        console.log("todo = ",todo)
        fileUtils.addUserTodo(userId,user_lang,todo,todo_file)
    },
    serialize_msg = function(array){
        let message = ""
            if ( array.todos){
                for(let i = 0; i < array.todos.length; i++)
                    message += "🕒: "+(i+1) + " - " +array.todos[i]+"\n"
    
            }else if (array.todos_checked){
                for(let i = 0; i < array.todos_checked.length; i++)
                    message += "✅: "+ (i+1) + " - " +array.todos_checked[i]+"\n"
    
            }
            console.log(message)

            console.log("todo.serialize_msg invoked")
        return message
    },
    
    get_command =  function(todolist,checkedList,userId){
        let msg = "";
        return new Promise((resolve, reject) => {
            fileUtils.getUserTodos(userId,fileUtils.todo_file).then(res =>{
                // console.log("res = ",res)
                if ( !res.error){
                    let todos = res.todos, taille = todos.length;
                    // console.log("todos = ", todos )
                    if ( taille){
                        msg += en_EN.serialize_msg_todolist_text + serialize_msg(res)
                        console.log(msg)

                        
                        if ( checkedList.length)
                            for (let j=0; j < checkedList.length; j++)
                                if ( userId == checkedList[j].chat_id && checkedList[j].todos_checked.length > 0)
                                msg += en_EN.serialize_msg_todolist_text + serialize_msg(checkedList[j])
                       
                    }
                    resolve(msg)
                }
            }).catch(e=>{
                reject(e)
            })
        console.log("get_command invoked")
        
        });
        
    },
    remove_command = function(userId,todolist, todoIndex){
    
        let tailleTodoList = todolist.length
        if ( tailleTodoList){
            
            todoIndex = parseInt(todoIndex)
            if ( isNaN(todoIndex) ) sendMsg(userId,"Invalid index")
            if (  todoIndex <= 0 ) sendMsg(userId,"Can not remove empty todos")
            else{
            
                for(let i = 0; i < tailleTodoList; i++)
                    if ( todolist[i].chat_id == userId){
                        if ( todoIndex > todolist[i].todos.length) {sendMsg(userId,"Invalid index"); removed =false; return}
                            todolist[i].todos.splice(todoIndex-1,1)
                        //if ( !todolist[i].todos.length) todolist.splice(i,1)
                        sendMsg(userId,"Todo removed 👍")  
                        break;
                        //return todolist
                    }
            }
                    
        }else{
            sendMsg(userId,"Can not remove empty todo list. Please add at least one before removing it")
        }
    
    },
    
    isTheRightSyntax = function(message){
        //De base on suppose que c'est la bonne syntaxe
        let yesItis = true, result = whichCommand(message);
        console.log("result = ",result)
        let command = result.data.command, instruction = result.data.instruction;
        command = command.toLowerCase()
        if ( instruction){ // L'utilisateur entre du texte après avoir écrit ces commandes
            if ( command == 'help' || command == 'get' || command == 'start')
            yesItis = false
    
        }else{ // L'utilisateur n'entre rien
            if ( command == 'add' || command == 'remove' || command == 'check') 
            yesItis = false;
        }
        return yesItis
    }, 
    
    sendMsg = function(chatId, text,mode=undefined){
        //console.log("mode = ",mode)
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
        // console.log("index =",index)
        let tailleArray = array.length
        if ( isNaN(parseInt(index.trim()))) return false;
        else if (index <= 0 ) return false;
        else{
            if ( tailleArray){ // at least one item
                console.log("verifINDEX HERE")
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
    
    check_command = function(todoIndex,todolist,checkedList,userId){
        console.log("userid = ",userId)
        let tailleTodoList = todolist.length, tailleCheckedList = checkedList.length

       if ( verifyIndex(todoIndex,todolist,userId)){
           //L'index entré est validé nous allons d'abord récupérer le todo
           let todo_to_check = undefined
           
            for(let i = 0; i < tailleTodoList ; i ++){
                if ( todolist[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                    todo_to_check = todolist[i].todos[todoIndex-1]
                    break;
                }
            }
            if ( todo_to_check !== undefined){
                if ( tailleCheckedList){
                    //Bd (table checkedList non vide)
                    let found = false;
                    console.log("Bd non vide")
                    //Nous allons effectuer une recherche pour savoir si l'utilisateur s'y trouve
                    for(let i = 0; i < tailleCheckedList ; i ++){
                        if ( checkedList[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                            checkedList[i].todos_checked.push(todo_to_check)
                            remove_command(userId,todolist,todoIndex)

                            found = true
                            break;
                        }
                    }
                    if ( !found) {// Si l'utilisateur n'y figure pas alors c'est son premier ajout
                    checkedList.push({chat_id:userId,todos_checked:[todo_to_check]})
                    remove_command(userId,todolist,todoIndex)

                }
                }else{
                    checkedList.push({chat_id:userId, todos_checked:[todo_to_check]})
                    remove_command(userId,todolist,todoIndex)

                    console.log("Bd vide, premier ajout")
                }
            }
            
            console.log("checkedList : ",checkedList)
            sendMsg(userId, "Added to the checked list. We are removing your todo")
            return;
                
                    
        }
       else
            sendMsg(userId,"Invalid Index")
        return;


     
    },
    reset = function(userId,array){
        try{
		for(let i = 0 ; i < array.length ; i++)
			if ( array[i].chat_id == userId)
				if ( array[i].todos)
					array[i].todos = new Array()
				else if (array[i].todos_checked)
                    array[i].todos_checked = new Array()
        }catch(e){
            console.log("Error occurs : ",e)
            sendMsg(userId,"Sorry an internal error occurs, we're  fixing it")
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
        change_language_preference
        
    }
    
   
   
} catch (error) {
    console.log("An error occurs")
}
