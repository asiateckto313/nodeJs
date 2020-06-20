//const { api } = require('./utils/todo');

//const { whichCommand } = require('./utils/todo');

const PORT = 3010,heure_ms = 3600 *1000, jour_ms = heure_ms * 24, annee_ms = jour_ms * 365;
try{ 
let express = require('express'),
    EventEmitter = require('events').EventEmitter
    todoUtils = require("./utils/todo"),
    fileUtils = require("./utils/file"),
    app = express(),
    server = require('http').createServer(app),
    api = todoUtils.api, 
    todolist = new Array(), checkList = new Array(),userId="",
    eventListener = new EventEmitter();
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
        ]
    ]
}, reset_option = {
    inline_keyboard:[
        [{
            text:"My to do list",
            callback_data: 'todolist'
        }],[
            {
                text:"My checked list",
                callback_data: 'checklist'
            }
        ]
    ]
};


api.on('inline.result', function(message)
{
    // Received chosen inline result
    console.log("received inline result : ",message);
});
//todolist constitue ici la bd avec un utilisateur (userId) qui peut avoir un ou plusieurs todos
api.on('inline.callback.query', function(message)
{
    let result = whichCommand(message), userId = message.from.id;
    if(!result.error){
        if(result.data.command == 'reset')
            todoUtils.sendMessage_with_inlineKey(userId,"*Choose a list to reset*",reset_option)
        if(result.data.command == 'help')
            todoUtils.help_command(userId)
        if(result.data.command == 'get'){
            let msg = todoUtils.get_command(todolist,checkList,userId)
                            if(msg !=="")
                                todoUtils.sendMsg(userId, msg)
                            else //{ 
                                todoUtils.sendMsg(userId,"⚠️ You don't have any todo, please add one before showing the list."); 
                              
        }

    }else{
        console.log("result = ",message.data)
    }
    console.log("result = ", result)
    // New incoming callback query
    //console.log(message);
});

    api.on('message', function(message)
    {
        userId = message.chat.id, username = message.chat.username 
       
       
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
                        
                            todoUtils.sendMsg(userId, "Todo added 👍")  
                        }
                        if(command == 'remove'){
                           
                            todoUtils.remove_command(userId,todolist,instruction) // Update the todolist array by removing one item
                           
                        }
                        if(command == 'check'){
                            todoUtils.check_command(instruction,todolist,checkList,userId)
                        }
                        if(command == 'reset'){
                            return
                            todoUtils.reset(userId,instruction)
                            
                        }
                    }else{
                        //Il s'agit de get ou help, ou d'un moyen de planter le programme
                        if(result.data.command.toLowerCase() == 'get'){
                            let msg = todoUtils.get_command(todolist,checkList,userId)
                            if(msg !=="")
                                todoUtils.sendMsg(userId, msg)
                            else //{ 
                                todoUtils.sendMsg(userId,"⚠️ You don't have any todo, please add one before showing the list."); 
                               /* todoUtils.reset(userId,todolist)
							}*/
                        } if (result.data.command.toLowerCase() == 'start')
                            todoUtils.welcome_command(userId,username)
                        if(result.data.command.toLowerCase() == 'help')
                            //return
                            todoUtils.help_command(userId)
                        if(result.data.command.toLowerCase() == 'commands')
                            todoUtils.sendMessage_with_inlineKey(userId,"*What do you want to do ?*",inlineKeyboard)

                    }
                }

            }
        }else{
            todoUtils.sendMsg(userId,"Not a bot command, please verify your syntax. Use the /help command to know the right syntax")
            console.log("Not a bot command please verify your syntax.")
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
