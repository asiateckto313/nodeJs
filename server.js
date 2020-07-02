//const { api } = require('./utils/todo');

const todo = require('./utils/todo');
const { ifError } = require('assert');

//const { whichCommand } = require('./utils/todo');

const PORT = 3010,heure_ms = 3600 *1000, jour_ms = heure_ms * 24, annee_ms = jour_ms * 365;

let express = require('express'),
    EventEmitter = require('events').EventEmitter,
    fr_FR = require("./langs/fr_FR"),
    todoUtils = require("./utils/todo"),
    todoUtils_fr = require("./utils/todo_fr"),
    fileUtils = require("./utils/file"),
    app = express(),
    server = require('http').createServer(app),
    api = todoUtils.api, 
    todolist = new Array(), checkList = new Array(),userId="",
    eventListener = new EventEmitter(),eng = true, french = false;
let  inlineKeyboard = {
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
}, langs_option = {
    inline_keyboard:[
        [{
            text:"English / Anglais",
            callback_data: '/set_bot_lang english'
        }],[
            {
                text:"French / Français",
                callback_data: '/set_bot_lang french'
            }
        ]
    ]
},add_inline = false, check_inline = false, remove_inline = false, set_lang_inline = false;
try{

api.on('inline.result', function(message)
{
    // Received chosen inline result
    console.log("received inline result : ",message);
});
//todolist constitue ici la bd avec un utilisateur (userId) qui peut avoir un ou plusieurs todos
api.on('inline.callback.query', function(message)
{
    let result = todoUtils.whichCommand(message), userId = message.from.id;
    
    
    if(eng){
        if(!result.error){

            if(result.data.command == 'reset'){
                if(result.data.instruction == 'todolist'){
                    todoUtils.reset(userId,todolist)
                    todoUtils.sendMsg(userId,'List has been reset')
                }
                if(result.data.instruction == 'checklist'){
                    todoUtils.reset(userId,checkList)
                    todoUtils.sendMsg(userId,'List has been reset')
    
                }
                if(result.data.instruction == undefined)
                    todoUtils.sendMessage_with_inlineKey(userId,"*Choose a list to reset*",reset_option)
    
            }
            if(result.data.command == 'set_bot_lang'){
                set_lang_inline = true
                if(!result.data.instruction)
                    todoUtils_fr.sendMessage_with_inlineKey(userId,"*Choose the language*",langs_option)
                else{
                    if(result.data.instruction.trim().toLowerCase()=='english'){eng = true;french = false;set_lang_inline = false}
                    if(result.data.instruction.trim().toLowerCase() == 'french'){eng = false; french = true; set_lang_inline = false}
                }
           
                
            }
    
            if(result.data.command == 'help')
                todoUtils.help_command(userId)
    
            if(result.data.command == 'get'){
                let msg = todoUtils.get_command(todolist,checkList,userId)
                                if(msg !=="")
                                    todoUtils.sendMsg(userId, msg)
                                else //{ 
                                    todoUtils.sendMsg(userId,"⚠️ You don't have any todo, please add one before showing the list."); 
                                  
            }
    
            if(result.data.command == 'add'){
                add_inline = true
                todoUtils.sendMsg(userId,"Send now the todo to add")
            }
            if(result.data.command == 'remove'){
                remove_inline = true
                todoUtils.sendMsg(userId,"Send now the index of the to remove")
    
            }
            if( result.data.command == 'check'){
                    check_inline= true
                    todoUtils.sendMsg(userId,"Send now the index of the todo to check")
    
            }
    
        }else{
            console.log("inline message.data = ",message.data)
        }
    }else{

        if(!result.error){

            if(result.data.command == 'reset'){
                if(result.data.instruction == 'todolist'){
                    todoUtils.reset(userId,todolist)
                    todoUtils.sendMsg(userId,fr_FR.reset_success_text)
                }
                if(result.data.instruction == 'checklist'){
                    todoUtils.reset(userId,checkList)
                    todoUtils.sendMsg(userId,fr_FR.reset_success_text)
    
                }
                if(result.data.instruction == undefined)
                    todoUtils_fr.sendMessage_with_inlineKey(userId,"*Sélectionner la liste à réinitialiser*",todoUtils_fr.reset_option_FR)
    
            }
            if(result.data.command == 'set_bot_lang'){
                set_lang_inline = true
                if(!result.data.instruction)
                    todoUtils_fr.sendMessage_with_inlineKey(userId,"*Sélectionner la langue*",langs_option)
                else{
                    if(result.data.instruction.trim().toLowerCase()=='english'){eng = true;french = false;set_lang_inline = false}
                    if(result.data.instruction.trim().toLowerCase() == 'french'){eng = false; french = true; set_lang_inline = false}
                }
           
                
            }
            if(result.data.command == 'help')
                todoUtils_fr.help_command(userId)
    
            if(result.data.command == 'get'){
                let msg = todoUtils_fr.get_command(todolist,checkList,userId)
                                if(msg !=="")
                                    todoUtils.sendMsg(userId, msg)
                                else //{ 
                                    todoUtils.sendMsg(userId, fr_FR.check_empty_text); 
                                  
            }
            
            if(result.data.command == 'add'){
                add_inline = true
                todoUtils.sendMsg(userId,fr_FR.add_todo_text)
            }
            if(result.data.command == 'remove'){
                remove_inline = true
                todoUtils.sendMsg(userId,fr_FR.remove_index_text)
    
            }
            if( result.data.command == 'check'){
                    check_inline= true
                    todoUtils.sendMsg(userId,fr_FR.check_index_text)
    
            }
    
    }
}
   
    console.log("inline result = ", result)
    // New incoming callback query
    //console.log(message); 
});

    api.on('message', function(message)
    {
        //Maintenant que nous avons deux langues pour chaque commande l'on doit vérifier quelle est la langue active
        userId = message.chat.id, username = message.chat.username 
       console.log(".on('message') : ", message)
       if(add_inline){
           if(eng){
                todoUtils.add_command(todolist,userId,message.text.trim())
                todoUtils.sendMsg(userId,"Todo added 👍")
                add_inline = false
           }else{
            todoUtils.add_command(todolist,userId,message.text.trim())
                todoUtils.sendMsg(userId,fr_FR.todo_added_text)
                add_inline = false
           }
       }else if(remove_inline){ 
           if(eng)
                todoUtils.remove_command(userId,todolist,parseInt(message.text.trim()))
            else todoUtils_fr.remove_command(userId,todolist,parseInt(message.text.trim()))
            remove_inline = false
           
       }else if(check_inline){
           if(eng)
                todoUtils.check_command(parseInt(message.text.trim()),todolist,checkList,userId)
            else
                todoUtils_fr.check_command(parseInt(message.text.trim()),todolist,checkList,userId)
        check_inline = false
       }else if(set_lang_inline){
           console.log("Dans le set_lang_inline")
           console.log(message)
            if(message.text.trim().toLowerCase()=='english'){eng = true;french = false}
            if(message.text.trim().toLowerCase() == 'french'){eng = false; french = true}
       }
       else{
       //We are going to check if user send a bot command or not
        if(message.entities){ //This is a bot command now we will figure out what command it is
            console.log("bot command")
            if(!todoUtils.isTheRightSyntax(message))
                todoUtils.sendMsg(userId, "❌ Wrong syntax, please take a look to the right syntax by sending /help")
            else{
                //Rigth syntax
                let result = todoUtils.whichCommand(message)
                if(!result.error){
                    let instruction = result.data.instruction
                    if(instruction){
                        let command = result.data.command.toLowerCase()
                        //La propriété instruction existe, il s'agit de add, check ou remove
                        if(command == 'add'){
                            
                            todoUtils.add_command(todolist,userId,result.data.instruction)
                            if(eng)
                                todoUtils.sendMsg(userId, "Todo added 👍") 
                            else    todoUtils.sendMsg(userId,fr_FR.todo_added_text) 
                        }
                        if(command == 'remove'){
                           if(eng)
                                todoUtils.remove_command(userId,todolist,instruction) // Update the todolist array by removing one item
                            else
                            todoUtils_fr.remove_command(userId,todolist,instruction) // Update the todolist array by removing one item

                           
                        }
                        if(command == 'check'){
                            if(eng)
                                todoUtils.check_command(instruction,todolist,checkList,userId)
                            else
                                todoUtils_fr.check_command(instruction,todolist,checkList,userId)
                        }
                        if(command == 'reset'){
                            return
                            todoUtils.reset(userId,instruction)
                            
                        }
                    }else{
                        //Il s'agit de get ou help, ou d'un moyen de planter le programme
                        if(result.data.command.toLowerCase() == 'get'){
                            if(eng){
                                let msg = todoUtils.get_command(todolist,checkList,userId)
                                if(msg !=="")
                                    todoUtils.sendMsg(userId, msg)
                                else //{ 
                                    todoUtils.sendMsg(userId,"⚠️ You don't have any todo, please add one before showing the list."); 
                                   /* todoUtils.reset(userId,todolist)
                                }*/
                            }else{
                                let msg = todoUtils_fr.get_command(todolist,checkList,userId)
                                if(msg != "")
                                    todoUtils.sendMsg(userId,msg)
                                else
                                    todoUtils.sendMsg(userId,fr_FR.check_empty_text)
                            }
                           
                        } if (result.data.command.toLowerCase() == 'start')
                            todoUtils.welcome_command(userId,username)
                        if(result.data.command.toLowerCase() == 'help'){
                            if(eng)
                                todoUtils.help_command(userId)
                            else
                            todoUtils_fr.help_command(userId)

                        }   
                        if(result.data.command.toLowerCase() == 'commands'){
                            if(eng)
                                todoUtils.sendMessage_with_inlineKey(userId,"*What do you want to do ?*",inlineKeyboard)
                            else
                                todoUtils_fr.sendMessage_with_inlineKey(userId,fr_FR.commands_button_text,todoUtils_fr.inlineKeyboard_fr)
                        }

                    }
                }

            }
        }else{
            todoUtils.sendMsg(userId,"Not a bot command, please verify your syntax. Use the /help command to know the right syntax")
            console.log("Not a bot command please verify your syntax.")
        }
    }
    });

    
    //We can offer the possibility to modify your wrong syntax
    
    api.on('edited.message', (message) => {
        console.log('message edited = ',message)
    })

}catch(err){
    console.log("DANS LE CATCH")
    console.log("error : ",err)
    // if(userId !== "")
    //     todoUtils.sendMsg(userId,"Sorry something wrong happened (server side). Don't worry it's an internal problem. We're on it to figure it out")
        
}finally{
    server.listen(PORT, () => {
        console.log('server is running on port', PORT)
    })
   
}
