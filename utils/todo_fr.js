
try {
    let fileUtils = require("./file"),
    fr_FR = require("../langs/fr_FR"),
    api= require("./todo").api,
    todoUtils = require("./todo"),
    
    
    welcome_command = function(userId,username = undefined){
        todoUtils.sendMsg(userId, fr_FR.welcome_command_text(username))
    },
    
    help_command = function(chatId){
        
        api.sendMessage({chat_id:chatId,
        text:fr_FR.help_text,
        parse_mode: 'Markdown'
    })
        api.sendMessage({chat_id:chatId,
        text:fr_FR.help_text_suite
    })
       
    },
    
    add_command = function(todolist,userId,todo,user_lang){
        todoUtils.add_command(todolist,userId,todo,user_lang);
    }, 
    
    
    get_command = function(todolist,checkedList,userId){
        let message = "";
        return new Promise((resolve, reject) => {
            fileUtils.getUserTodos(userId,fileUtils.todo_file).then(res =>{
                // console.log("res = ",res)
                if(!res.error){
                    let todos = res.todos, taille = todos.length;
                    // console.log("todos = ", todos )
                    if(taille){
                        message += fr_FR.serialize_msg_todolist_text + todoUtils.serialize_msg(res)
                        console.log(message)

                        
                        if(checkedList.length)
                            for (let j=0; j < checkedList.length; j++)
                                if(userId == checkedList[j].chat_id && checkedList[j].todos_checked.length > 0)
                                    message += fr_FR.serialize_msg_checklist_text + todoUtils.serialize_msg(checkedList[j])
                       
                    }
                    resolve(message)
                }
            }).catch(e=>{
                reject(e)
            })
        console.log("todo_fr.get_command invoked")
        
        })
        console.log(todolist.length)
    
        if(todolist.length ){
           
            for (let j=0; j < todolist.length; j++){
                //Si jamais l'utilisateur userId a des todos alors on formalise le msg
                if(userId == todolist[j].chat_id && todolist[j].todos.length > 0)
                    message += fr_FR.serialize_msg_todolist_text + todoUtils.serialize_msg(todolist[j])
                
                    

            }
            if(checkedList.length)
            for (let j=0; j < checkedList.length; j++)
                if(userId == checkedList[j].chat_id && checkedList[j].todos_checked.length > 0)
                    message += fr_FR.serialize_msg_checklist_text + todoUtils.serialize_msg(checkedList[j])
            
        
        }else{
            if(!checkedList.length)
                message = fr_FR.check_empty_text
            else{
                for (let j=0; j < checkedList.length; j++){
                    if(userId == checkedList[j].chat_id && checkedList[j].todos_checked.length > 0)
                        message += fr_FR.serialize_msg_checklist_text + serialize_msg(checkedList[j])
            }
        }
        
        
    }
    console.log("todo_fr.get_command invoked")
    return message
    },
    remove_command = async  function(userId,todolist, todoIndex){
       try {  
            todoIndex = parseInt(todoIndex)
            if(isNaN(todoIndex) ) todoUtils.sendMsg(userId,fr_FR.invalid_index_text)
            if( todoIndex <= 0 ) todoUtils.sendMsg(userId,fr_FR.invalid_index_text)
            if(todoIndex > todolist.length) todoUtils.sendMsg(userId,fr_FR.invalid_index_text)
            else {
                let tailleTodoList = todolist.length, user_lang = await fileUtils.getUserLang(userId, fileUtils.todo_file);
                user_lang = user_lang.data;
                todolist.splice(todoIndex-1,1)
                console.log(todolist)
                fileUtils.addUserTodo(userId, user_lang, todolist, fileUtils.todo_file)
                todoUtils.sendMsg(userId,fr_FR.remove_command_text)  

            }
            console.log("remove_command invoked")
        } catch (e) {
            console.log("remove_command error invoked")
            console.error(e.message)
        }
        /*if(tailleTodoList){
            
            todoIndex = parseInt(todoIndex)
            if(isNaN(todoIndex) ) todoUtils.sendMsg(userId,fr_FR.invalid_index_text)
            if( todoIndex <= 0 ) todoUtils.sendMsg(userId,fr_FR.invalid_index_text)
            // if( todoIndex > tailleTodoList) todoUtils.sendMsg(userId, fr_FR.invalid_index_text)
            else{
            
                for(let i = 0; i < tailleTodoList; i++)
                    if(todolist[i].chat_id == userId){
                        if(todoIndex > todolist[i].todos.length) {todoUtils.sendMsg(userId,fr_FR.invalid_index_text); removed =false; return}
                            todolist[i].todos.splice(todoIndex-1,1)
                            fileUtils.addUserTodo(userId,user_lang,todolist[i].todos,fileUtils.todo_file)
                        //if(!todolist[i].todos.length) todolist.splice(i,1)
                        todoUtils.sendMsg(userId,fr_FR.remove_command_text)  
                        break;
                        //return todolist
                    }
            }
                    
        }else{
            todoUtils.sendMsg(userId,fr_FR.remove_empty_todo)
        }*/
    
    },
    
    isTheRightSyntax = function(message){
        //De base on suppose que c'est la bonne syntaxe
        todoUtils.isTheRightSyntax(message)
    }, 
    
    
    check_command = function(todoIndex,todolist,checkedList,userId){
        // console.log("userid = ",userId)
        console.log("FR_CHECK")
        let tailleTodoList = todolist.length, tailleCheckedList = checkedList.length
       //TODO use the remove_command to delete automatically the todo (say it in the presentation)

       if(todoUtils.verifyIndex(todoIndex,todolist,userId)){
           //L'index entré est validé nous allons d'abord récupérer le todo
           let todo_to_check = todolist[todoIndex - 1];
           
            for(let i = 0; i < tailleTodoList ; i ++){
                if(todolist[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                    todo_to_check = todolist[i].todos[todoIndex-1]
                    break;
                }
            }
            if(todo_to_check !== undefined){
                // console.log('todo_to_check = ', todo_to_check)
                if(tailleCheckedList){
                    //Bd (table checkedList non vide)
                    let found = false;
                    console.log("Bd non vide")
                    //Nous allons effectuer une recherche pour savoir si l'utilisateur s'y trouve
                    for(let i = 0; i < tailleCheckedList ; i ++){
                        if(checkedList[i].chat_id == userId){//On se trouve sur la ligne de l'utilisateur
                            checkedList[i].todos_checked.push(todo_to_check) //ajout du todo
                            todoUtils.remove_command(userId,todolist,todoIndex)
                            found = true
                            break;
                        }
                    }
                    if(!found) {// Si l'utilisateur n'y figure pas alors c'est son premier ajout
                    checkedList.push({chat_id:userId,todos_checked:[todo_to_check]})
                    remove_command(userId,todolist,todoIndex)

                }
                }else{
                    // console.log('u = ', todolist)
                    checkedList.push({chat_id:userId, todos_checked:[todo_to_check]})
                    remove_command(userId,todolist,todoIndex)

                    console.log("Bd vide, premier ajout")
                }
            }
            
            console.log("checkedList : ",checkedList)
            todoUtils.sendMsg(userId, fr_FR.check_command_text)
            return;
                
                    
        }
       else
            todoUtils.sendMsg(userId,fr_FR.invalid_index_text)
        return;
     
    },
    reset = function(userId,array){
        todoUtils.reset(userId,array)
        
	},sendMessage_with_inlineKey = function(userId,msg,inline){
        todoUtils.sendMessage_with_inlineKey(userId,msg,inline)
    };
    
    let  inlineKeyboard_fr = {
    inline_keyboard: [
        [
            {
                text: 'Besoin d\'aide',
                callback_data: '/help'
            }
            
        ],
        [
            {
                text: 'Ajouter une tâche',
                callback_data: '/add'
            },
            {
                text: 'Lister mes tâches',
                callback_data: '/get'
            }
            
        ],
        [
            {
                text: 'Cocher ✅',
                callback_data: '/check'
            },{
                text: 'Supprimer une tâche',
                callback_data: '/remove'
            }
        ],[
            {
                text: 'Réinitialiser',
                callback_data: '/reset'
            }
        ],[
            {
                text: 'Modifier la langue du bot',
                callback_data: '/set_bot_lang'
            }
        ]
    ]
},reset_option_FR = {
    inline_keyboard:[
        [{
            text:"Ma liste des tâches à faire",
            callback_data: '/reset todolist'
        }],[
            {
                text:"Ma liste de tâches accomplies",
                callback_data: '/reset checklist'
            }
        ]
    ]
};
    module.exports = {

        add_command,
        get_command,
        remove_command,
        isTheRightSyntax,
        welcome_command,
        check_command,
        reset,
        help_command,
        sendMessage_with_inlineKey,
        inlineKeyboard_fr,
        reset_option_FR
    }
    
} catch (error) {
    console.log("An error occurs : ",error)
}