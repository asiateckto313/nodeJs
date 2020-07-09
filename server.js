const todo_file = './todos.txt';
const PORT = 3010,heure_ms = 3600 *1000, jour_ms = heure_ms * 24, annee_ms = jour_ms * 365;

let express = require('express'),
    fs = require('fs'),
    fr_FR = require("./langs/fr_FR"),
    en_EN = require("./langs/en_EN"),
    todoUtils = require("./utils/todo"),
    todoUtils_fr = require("./utils/todo_fr"),
    fileUtils = require("./utils/file"),
    app = express(),
    server = require('http').createServer(app),
    api = todoUtils.api, 
    todolist = new Array(), checkList = new Array(),userId="",
    newcomer = false;
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
},add_inline = false, check_inline = false, remove_inline = false, set_lang_inline = false,username = undefined,
read = async function(todo_file){
    return await fileUtils.read_file(todo_file)
};

try{

api.on('inline.result', function(message)
{
    // Received chosen inline result
    console.log("received inline result : ",message);
});
//todolist constitue ici la bd avec un utilisateur (userId) qui peut avoir un ou plusieurs todos
api.on('inline.callback.query', function(message)
{
    console.log(message)
    let result = todoUtils.whichCommand(message), userId = message.from.id, username  = message.message.chat.username;
    (username == undefined || username == "-") ? username = message.message.chat.first_name : username = username;
    if(result.data.command == 'set_bot_lang'){
        set_lang_inline = true
        if(!result.data.instruction)
            todoUtils_fr.sendMessage_with_inlineKey(userId,"*Choose the language*",langs_option)
        else{
            if(result.data.instruction.trim().toLowerCase()=='english'){
                todoUtils.change_language_preference(userId,'english',todo_file)
                set_lang_inline = false
                todoUtils.sendMsg(userId,"✅ Language set to English")
                console.log("newcomer english : ",newcomer)

                if(newcomer) todoUtils.welcome_command(userId,username) 
                else console.log(newcomer = newcomer);
                newcomer = false;

            }
            if(result.data.instruction.trim().toLowerCase() == 'french'){
                todoUtils.change_language_preference(userId,'french',todo_file)
                set_lang_inline = false
                todoUtils.sendMsg(userId,"✅ Langue choisie : Français")
                console.log("newcomer french : ",newcomer)
                if(newcomer)  todoUtils_fr.welcome_command(userId,username)
                else newcomer = newcomer;
                newcomer = false
            }
        }
    }

    if(result.data.command == "help"){
        (user_lang == "english") ? todoUtils.help_command(userId) : todoUtils_fr.help_command(userId)
    }
});

api.on('message', function(message){
    let user_lang = undefined,tmp;
    userId = message.chat.id, username = message.chat.username
    
    if(username == undefined || username == "-") username = message.chat.first_name

    fileUtils.getUserLang(userId,todo_file).then(result => {
        console.log("getUserLang result = ",result)
        if(!result.error){
            user_lang = result.data
            if(user_lang == 'Nothing' || user_lang == "undefined"){// Nous avons affaire à un nouvel utilisateur
                fileUtils.addNewComer(userId,todo_file)
                newcomer = true;
                todoUtils.sendMessage_with_inlineKey(userId,"*Please set the bot language*",langs_option)
            }else if (user_lang == "french" || user_lang == 'english'){
                //Ancien utilisateur car la langue est soit undefined soit english soit français
                if(message.entities){
                    //Verify if the user started the bot, if true then he has to set the bot language
                    if(!todoUtils.isTheRightSyntax(message)){
                        (user_lang == "undefined") ? user_lang = 'english' : user_lang = user_lang;
            
                        (user_lang == 'english') ? todoUtils.sendMsg(userId, en_EN.wrong_syntax) : todoUtils.sendMsg(userId,fr_FR.wrong_syntax)
    
                    }
                    else{
                        //The right syntax
                        let result = todoUtils.whichCommand(message), command = result.data.command,instruction = result.data.instruction
                        if(user_lang == "french"){
                            //buttons
                            if(add_inline){
                                
                                todoUtils_fr.add_command(todolist,userId,message.text.trim(),user_lang)
                                fileUtils.saveTodo(todolist)
                                todoUtils.sendMsg(userId,fr_FR.todo_added_text)
                                add_inline = false
                                
                            }else if(remove_inline){ 
                                todoUtils_fr.remove_command(userId,todolist,parseInt(message.text.trim()))
                                remove_inline = false
                                
                            }else if(check_inline){
                            
                                todoUtils_fr.check_command(parseInt(message.text.trim()),todolist,checkList,userId)
                                check_inline = false
                            }else{
                                //syntaxe brute partie française
                                //Si l'on a une ou des instructions il s'agit des commandes add, check, remove, reset
                                if(instruction){
                                    
                                    if(command == 'add'){
                                
                                        todoUtils_fr.add_command(todolist,userId,instruction,user_lang)
                                        //fileUtils.saveTodo(todolist)
                                        todoUtils.sendMsg(userId,fr_FR.todo_added_text)

                                    }
                                        
                                        // todoUtils_fr.add_command(todolist,userId,instruction,user_lang)
                                        // fileUtils.saveTodo(todolist)

                                        // todoUtils.sendMsg(userId,fr_FR.todo_added_text)
                                    

                                    if(command == "remove")
                                    todoUtils_fr.remove_command(userId,todolist,instruction) // Update the todolist array by removing one item

                                    if(command == "check")
                                    todoUtils_fr.check_command(instruction,todolist,checkList,userId)

                                    if(command == 'reset'){
                                        //TODO reset
                                        todoUtils.sendMsg(userId,"Nous sommes en train d'implémenter cette syntaxe")
                                    }

                                }else{ // Sans instruction il s'agit des syntaxes get, commands et help
                                    if(command == 'commands')
                                        todoUtils_fr.sendMessage_with_inlineKey(userId,fr_FR.commands_button_text,todoUtils_fr.inlineKeyboard_fr)

                                    if(command == "help")
                                        todoUtils_fr.help_command(userId)
                               
                                    if(command == 'get'){
                                        todoUtils_fr.get_command(todolist,checkList,userId).then(msg => {
                                            console.log("msg = ",msg)
                                            if(msg != "")
                                                todoUtils.sendMsg(userId,msg)
                                            else
                                                todoUtils.sendMsg(userId,fr_FR.check_empty_text)
                                        })
                                        
                                    }
                                }
                                
                                
                               

                            }
                        }else if (user_lang == "english"){
                            //buttons
                            if(add_inline){
                                
                                todoUtils.add_command(todolist,userId,message.text.trim(),user_lang)
                                todoUtils.sendMsg(userId,"Todo added 👍")
                                add_inline = false
                                
                            }else if(remove_inline){ 
                                
                                todoUtils.remove_command(userId,todolist,parseInt(message.text.trim()))
                                remove_inline = false
                                
                            }else if(check_inline){
                                
                                todoUtils.check_command(parseInt(message.text.trim()),todolist,checkList,userId)
                                check_inline = false
                            }else{
                                //syntaxes brutes
                                if(command == 'help')
                                    todoUtils.help_command(userId)
                                if(command == 'commands')
                                    todoUtils.sendMessage_with_inlineKey(userId,"*What do you want to do ?*",inlineKeyboard)

                            }
                        }
                    }
                    
                   
        
                }//Fin de if message.entities
    
            }

            
    
        } // Fin de if (!result.error)

     }).catch((e)=>{
         //Le fichier est vide
         console.log("Fichier vide, première insertion : ",e)
     })

});

    
//We can offer the possibility to modify your wrong syntax
    
api.on('edited.message', (message) => {
    console.log('message edited = ',message)
})

}catch(err){
    console.log("DANS LE CATCH")
    console.log("error : ",err)
            
}finally{
    server.listen(PORT, () => {
        console.log('server is running on port', PORT)
    })
   
}