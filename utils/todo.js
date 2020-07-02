//TODO try to think about reminder feature, if the todos added take a long time to be checked, send a message or a notification
//TODO really later think about add a due date for a todo to get reminded
// TODO multi lines todo adding
//TODO remove automatically a todo when checked
try {
    let fileUtils = require("./file"),telegram = require('telegram-bot-api'),api = new telegram({
        token: 'TOKEN',
        updates: {
            enabled: true,
            get_interval: 1000
    }}),

    
    whichCommand = function (message){
        let command = undefined, instruction = undefined, tmp="";
        try {
            command = message.text.trim().split('/').slice(1)[0].split(' ')[0],
            instruction = message.text.trim().split('/').slice(1)[0].split(' ');
            console.log(instruction)
            for(let i = 1; i< instruction.length; i++)
                tmp += instruction[i] + " "
            tmp = tmp.trim();
            if(!tmp){
                console.log("ICi")
                //Case of help or get command
                return {error : false, "data":{"command":command}}
                
            }else{
                //Cas of add , remove or check
                console.log("LA")
                return {error : false, data:{"command":command,"instruction":tmp}}
            }
                
        } catch (e) {
            console.log("Dans le catch")
            try{
            if(message.data.split(' ').length == 1) command = message.data.split(' ')[0].trim().split('/')[1].toLowerCase()
            if(message.data.split(' ').length == 2){
                command = message.data.split(' ')[0].trim().split('/')[1]
                instruction = message.data.split(' ')[1]
                
            }
            return {error:false,"data":{"command":command,"instruction":instruction}}
        }catch(f){
            return {error : true, error_msg:f}
        }            
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
        "*Please note :* If you have at least checked a todo to have the list of your todos checked, send /get\n\n\t*Show command buttons*\n\n\t"+
        "Send the /commands to see the same syntax in a designed buttons.\n\n\tPlease if any errors occurs let me know @superPablo_E. Thank you in advance and enjoy."
        //sendMsg(chatId,msg,'Markdown')
        api.sendMessage({chat_id:chatId,
        text:msg
        //parse_mode: 'Markdown'
    })
       
    },multi_add = function(userId,todos){
        let nbLigne = todos.split('\n').length, user= {chat_id: undefined,todos : []}
        user.chat_id = userId
        for(let i = 0; i <nbLigne; i++)
            user.todos.push(todos.split('\n')[i])

        return user
    },
    
    add_command = function(todolist,userId,todo){
        let nbLigne = todo.split('\n').length
        console.log("nbLigne = ",nbLigne)
        //Lorsqu'il y a au moins une personne qui a ajouté quelque chose 
        if(todolist.length){
            //Si jamais cet utilisateur a déjà ajouté quelque chose on le cherche par son id
            for(let i = 0; i <todolist.length; i ++)
                if(todolist[i].chat_id == userId){
                    console.log("trouvé")
                    let temp = multi_add(userId,todo).todos
                    todolist[i].todos = todolist[i].todos.concat(temp)
                    return //sors de la fonction
                }
            //Sinon si après recherche l'utilisateur ne se gittrouve pas dans la bd, alors c'est la première fois qu'il ajoute quelque chose
            todolist.push(multi_add(userId,todo))
            
            
        }else{
            //Empty db, it is the first push
            todolist.push(multi_add(userId,todo))
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
        let yesItis = true, result = whichCommand(message);
        console.log("result = ",result)
        let command = result.data.command, instruction = result.data.instruction;
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
        //console.log("mode = ",mode)
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
        else if (index <= 0 ) return false;
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
        console.log("userid = ",userId)
        let tailleTodoList = todolist.length, tailleCheckedList = checkedList.length

       if(verifyIndex(todoIndex,todolist,userId)){
           //L'index entré est validé nous allons d'abord récupérer le todo
           let todo_to_check = undefined
           
            for(let i = 0; i < tailleTodoList ; i ++){
                if(todolist[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                    todo_to_check = todolist[i].todos[todoIndex-1]
                    break;
                }
            }
            if(todo_to_check !== undefined){
                if(tailleCheckedList){
                    //Bd (table checkedList non vide)
                    let found = false;
                    console.log("Bd non vide")
                    //Nous allons effectuer une recherche pour savoir si l'utilisateur s'y trouve
                    for(let i = 0; i < tailleCheckedList ; i ++){
                        if(checkedList[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                            checkedList[i].todos_checked.push(todo_to_check)
                            remove_command(userId,todolist,todoIndex)

                            found = true
                            break;
                        }
                    }
                    if(!found) {// Si l'utilisateur n'y figure pas alors c'est son premier ajout
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
	},sendMessage_with_inlineKey = function(userId,msg,inline){
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
        sendMessage_with_inlineKey
        
    }
    
   
   
} catch (error) {
    console.log("An error occurs")
}