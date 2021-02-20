
let help_text = "Welcome to the ToDolistBot. This bot helps you manage and track your todos.You can add new todo or get the list of your todos.\n"

"*Adding a new todo *"+"\n\t\tThe following example shows you how to add the todo 'go to the market':"+
"\n\t\t/add go to the market"+

"\n\t\t*NOTE*: if you want to add multiple todos once, you just have to do as we said earlier (/add go to the market) and"+
" any other todo that follows must be at the next line."+
"\n\t\tExample: "+
" /add go to the market"+
"\ngo to the dentist"+
"\nbuy trash bags"+
"\ndo the dishes"+

"\n\n*Listing your todos*"+
"\n\t\tTo get the list of your todos, you just have to send the /get command."+

"\n\t\t*NOTE*: you just have to send /get without anything after !!"+

"\n\n*Checking a todo(✅)*"+
"\n\t\tTo check a todo (make it as completed) : "+
"\n\t\t1. First, send the /get command to have the list of your todos"+
"\n\t\t2. Then, use the /check command and the index of the todo to check(1,2,...)"+
"\n\t\t(Example : /check 2)"

"\n\n*Removing a todo*"+
"\n\t\tAs the /check command, specify the index of the todo to remove."+
"\n\t\tExemple:If you want to remove the 2nd todo of your list you can do the following: /remove 2"

"\n\n*Resetting a list*"+
"\n\t\tTo reset a list which can either be the checked list or the todos one you can do it by following this syntax :"+
"\n\t\t/reset todo (will reset, delete all of your todos)"+
"\n\t\t/reset check (will reset, delete all your todos checked)"+
"\n\t\t*NOTE* : If you have at least checked a todo to have the list of your todos checked, send the /get command"+

"\n\n*Show command buttons*"+
"Send the /commands (/add, /get, /check, /remove, /help) to see the same syntax in a designed button.\n\n\nPlease if any errors occurs let me know @superPablo_E. Thank you in advance and enjoy !! 😊😊",
add_todo_text = "Send now the todo to add please 😊", todo_added_text = "👍 Todo added ☺️",not_a_bot_command = "Not a bot command, please verify your syntax. Use the /help command to know the right syntax",
wrong_syntax = "❌ Wrong syntax, please take a look to the right syntax by sending /help",
welcome_command_text = function(username){
    return "Hello @"+ username+" and thank you for using my bot. Let me know if any problem occurs because it's my first bot. Hope you will enjoy 😏."},
check_command_text = "Added to the checked list 👍👍. Please remove this todo from your todos.",invalid_index_text= "Invalid index ", remove_command_text = "Todo removed 👍👍 😊",
serialize_msg_todolist_text = "Your todos : \n",serialize_msg_checklist_text = "\nYour todos checked : \n",check_empty_text= "⚠️ You don't have any todo, please add one before showing the list.",
remove_empty_todo = "😕Sorry, cannot delete a list with no content. Please add a todo before removing it.";
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
};

module.exports = {
    help_text,
    add_todo_text,
    todo_added_text,
    welcome_command_text,
    check_command_text,
    invalid_index_text,
    remove_command_text,
    serialize_msg_todolist_text,
    serialize_msg_checklist_text,
    check_empty_text,
    remove_empty_todo,
    not_a_bot_command,
    wrong_syntax,
    inlineKeyboard,
    reset_option
}