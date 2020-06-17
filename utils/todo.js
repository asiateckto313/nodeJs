//TODO try to think about reminder feature, if the todos added take a long time to be checked, send a message or a notification
//TODO really later think about add a due date for a todo to get reminded
try {
    let fileUtils = require("./file"),telegram = require('telegram-bot-api'),api = new telegram({
        token: '1209564117:AAGxyXoO0m_JwCImRL1gIRFIYg3A39m67FE',
        updates: {
            enabled: true,
            get_interval: 1000
    }}), EventEmitter = require('events').EventEmitter,
    fs = require('fs'), events = new EventEmitter()
    
    whichCommand = function (message){
        let command = undefined, instruction = undefined, tmp="";
        try {
            command = message.text.trim().split('/').slice(1)[0].split(' ')[0],
            instruction = message.text.trim().split('/').slice(1)[0].split(' ');
            for(let i = 1; i< instruction.length; i++)
                tmp += instruction[i] + " "
            tmp = tmp.trim();
    
            if(!instruction){
                //Case of help or get command
                return {error : false, data:{"command":command}}
                
            }else{
                //Cas of add , remove or check
                return {error : false, data:{"command":command,"instruction":tmp}}
            }
                
        } catch (e) {
            return {error : true, error_msg:e}
        }
    },
    
    welcome_command = function(userId,username = undefined){
        sendMsg(userId, "Hello @"+ username+" and thank you for using my bot. Let me know if any problem occurs because it's my first bot. Hope you will enjoy.")
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
        "*Please note :* If you have at least checked a todo to have the list of your todos checked, send /get\n\n\tPlease if any errors occurs let me know @superPablo_E. Thank you in advance and enjoy."
        //sendMsg(chatId,msg,'Markdown')
        api.sendMessage({chat_id:chatId,
        text:msg/*,TODO Search how to user Markdown as parse_mode
        parse_mode:'Markdown'*/
        })
       
    },
    
    add_command = function(todolist,userId,todo){
        //Lorsqu'il y a au moins une personne qui a ajouté quelque chose 
        if(todolist.length){
            //Si jamais cet utilisateur a déjà ajouté quelque chose on le cherche par son id
            for(let i = 0; i <todolist.length; i ++)
                if(todolist[i].chat_id == userId){
                    todolist[i].todos.push(todo)
                    return //sors de la fonction
                }
            //Sinon si après recherche l'utilisateur ne se gittrouve pas dans la bd, alors c'est la première fois qu'il ajoute quelque chose
            todolist.push({chat_id:userId,todos:[todo]})
            
            
        }else{
            //Empty db, it is the first push
            todolist.push({chat_id:userId,todos:[todo]})
        }
        //fileUtils.saveTodo(todolist)
        
        //TODO read the file todos.json and write it in the file
    }, 
    serialize_msg = function(array){
        let message = ""
            if(array.todos){
                for(let i = 0; i < array.todos.length; i++)
                    message += "🕒: "+(i+1) + " - " +array.todos[i]+"\n"
    
            }else if (array.todos_checked){
                for(let i = 0; i < array.todos_checked.length; i++)
                    message += "✅: "+ (i+1) + " - " +array.todos_checked[i]+"\n"
    
            }
        return message
    },
    
    get_command = function(todolist,checkedList,userId){
        let message = "";
        console.log(todolist.length)
        if(todolist.length ){
           
            for (let j=0; j < todolist.length; j++){
                //Si jamais l'utilisateur userId a des todos alors on formalise le msg
                if(userId == todolist[j].chat_id && todolist[j].todos.length > 0)
                    message += "Your todos :\n" + serialize_msg(todolist[j])
                
                    

            }
            if(checkedList.length)
            for (let j=0; j < checkedList.length; j++)
                if(userId == checkedList[j].chat_id && checkedList[j].todos_checked.length > 0)
                    message += "\n\nYour todos_checked :\n" + serialize_msg(checkedList[j])
            
        
        }else{
            if(!checkedList.length)
                message = "⚠️ You don't have any todo, please add one before showing the list."
            else{
                for (let j=0; j < checkedList.length; j++){
                    if(userId == checkedList[j].chat_id && checkedList[j].todos_checked.length > 0)
                        message += "Your todos_checked :\n" + serialize_msg(checkedList[j])
            }
        }
        
        
    }
    return message
    },
    remove_command = function(userId,todolist, todoIndex){
    
        let tailleTodoList = todolist.length
        if(tailleTodoList){
            
            todoIndex = parseInt(todoIndex)
            if(isNaN(todoIndex) ) sendMsg(userId,"Invalid index")
            if( todoIndex <= 0 ) sendMsg(userId,"Can not remove empty todos")
            else{
            
                for(let i = 0; i < tailleTodoList; i++)
                    if(todolist[i].chat_id == userId){
                        if(todoIndex > todolist[i].todos.length) {sendMsg(userId,"Invalid index"); removed =false; return}
                            todolist[i].todos.splice(todoIndex-1,1)
                        //if(!todolist[i].todos.length) todolist.splice(i,1)
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
        let yesItis = true, result = whichCommand(message), 
        command = result.data.command, instruction = result.data.instruction;
        command = command.toLowerCase()
        if(instruction){ // L'utilisateur entre du texte après avoir écrit ces commandes
            if(command == 'help' || command == 'get')
            yesItis = false
    
        }else{ // L'utilisateur n'entre rien
            if(command == 'add' || command == 'remove' || command == 'check' || command == 'reset' ) 
            yesItis = false;
        }
        return yesItis
    }, 
    
    sendMsg = function(chatId, text,mode=undefined){
        console.log("mode = ",mode)
        if(mode)
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
        let tailleArray = array.length
        if(isNaN(parseInt(index))) return false;
        else{
            if(tailleArray){ // at least one item
                for(let i = 0; i < tailleArray; i ++)
                    if(array[i].chat_id == userId){
                       if (index > array[i].todos.length) return false
                    }
                
            }else{ //empty
                if(index < tailleArray) return false
                if(index > tailleArray) return false
            }
        }
        return true
        
    },
    
    check_command = function(todoIndex,todolist,checkedList,userId){

        let tailleTodoList = todolist.length, tailleCheckedList = checkedList.length
       //TODO the same as the remove because it's based on the index too
       console.log("verifyIndex = ",verifyIndex(todoIndex,todolist,userId))

       if(verifyIndex(todoIndex,todolist,userId)){
           
            for(let i = 0; i < tailleTodoList ; i ++){
                if(tailleCheckedList){
                    //Bd pour la checklist non vide
                    if(todolist[i].chatId == userId){
                        //Vérifie si l'utilisateur x a déjà checked something
                        for(let j= 0; j < tailleCheckedList; j++)
                            if (checkedList[j].chat_id == userId){
                                console.log("Ici")
                                checkedList[j].todos_checked.push(todolist[i].todos[todoIndex-1])
                                break;
                            }
                        checkedList.push({chat_id:userId,todos_checked:todolist[i].todos.slice(todoIndex-1,todoIndex)})
                    }
                    

                }else
                    if(todolist[i].chat_id == userId){
                        console.log("Là")
                        checkedList.push({chat_id:userId, todos_checked:todolist[i].todos.slice(todoIndex-1,todoIndex)})
                        break;
                    }
            }
            console.log("checkedList : ",checkedList)
            sendMsg(userId, "Added to the checked list. Please remove this todo from your todos")
            return;
                
                    
        }
       else
            sendMsg(userId,"Invalid Index")
        return;


       if(!tailleTodoList){
           sendMsg(userId,"Please add a todo before wanting to check it")
       }else{
           try {
            todoIndex = parseInt(todoIndex)
            if(isNaN(todoIndex)){sendMsg(userId,"Invalid index"); return;}
            else{
                for(let i = 0; i < tailleTodoList; i ++)
                    if(userId == todolist[i].chat_id)
                        if(todoIndex <= 0 && todoIndex > tailleTodoList){
                            sendMsg(userId, "Invalid index")
                            return;
                        }else{
                            console.log("Yooo")
                            if(tailleCheckedList){
                                //for(let i = 0; i < tailleCheckedList)

                            }else{// First push
                                checkedList.push({chatId:userId, todos_checked:todolist[i].todos.slice(todoIndex-1,todoIndex)})
                                console.log("checkedList : ",checkedList)
                                sendMsg(userId, "Added to the checked list. Please remove this todo from your todos")
                                return ;

                            }
                        }
            }
             
           } catch (error) {
               sendMsg(userId,"An internal error occurs, we're on it")
               console.error(error)
                return ;
           }
           
    
       }
    },
    reset = function(userId,array){
        try{
		for(let i = 0 ; i < array.length ; i++)
			if(array[i].chat_id == userId)
				if(array[i].todos)
					array[i].todos = new Array()
				else if (array[i].todos_checked)
                    array[i].todos_checked = new Array()
        }catch(e){
            console.log("Error occurs : ",e)
            sendMsg(userId,"Sorry an internal error occurs, we're  fixing it")
            sendMsg(440227163,"An error occurs : "+e)
        }
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
        help_command
        
    }
    
    events.on('Error', function(err){
        console.log("Something wrong happened")
    })
   
} catch (error) {
    console.log("An error occurs")
}
