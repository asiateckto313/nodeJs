const todo_file = "/Users/pablo_e/Desktop/Programmes en nodeJs/telegram_api/todos.txt",
    checked_file = __dirname + 'checked.json';

let fs = require("fs"), todoUtils = require("./todo");


saveTodo =   function(todolist){
  try {
    fs.writeFile(todo_file, JSON.stringify(todolist), (err) => {
      if (err) console.log("We've got an error : ", err)
      console.log('The file has been saved!');
      });
    /*fs.open(todo_file, 'w', (err, fd) => {
      if (err) throw err;
      fs.appendFile(fd, JSON.stringify(todolist), 'utf8', (err) => {
        fs.close(fd, (err) => {
          if (err) throw err;
        });
        if (err) throw err;
      });
    });*/
  } catch (error) {
    console.log("saveTodoErr : ",error)
  }
  
  return;
}, updateFile = function(){

}, read_file =  function(todo_file){
  return new Promise((resolve,reject)=>{
    fs.readFile(todo_file,'utf8',(err, data)=>{
    if(err) reject(err)
    else{
      try {
        resolve(JSON.parse(data))
      } catch (e) {
        reject(e)
      }
       

    }
})
  })
}, getUserLang = async function(userId,todo_file){
  try {
    let datas = await read_file(todo_file),taille = datas.length;
    // console.log(datas)
    for(let i = 0; i< taille; i++)
      if(datas[i].chat_id == userId)
        return {error:false,data:datas[i].lang}
    //console.log(result)
  } catch (error) {
    return {error:true,error_msg:error}
  }
    return {error:false, data:"Nothing"}
  
}, getUserTodos = async function(userId,todo_file){
  try {
    let todolist = await read_file(todo_file), todos = undefined,taille = todolist.length;
    if(taille){
      //bd non vide
      for(let i = 0 ; i < taille ; i++){
        if(todolist[i].chat_id == userId)
          return {error:false,todos:todolist[i].todos}
      }
  
    }else{
      //bd vide
      return {error:false, todos: []}
    }
    
  } catch (err) {
    return {error:true,error_msg:err}
  }
  
},multi_add = function(userId,todos,user_lang){

  let nbLigne = todos.split('\n').length, user= {chat_id: userId,lang:user_lang,todos : []}
  for(let i = 0; i <nbLigne; i++)
      user.todos.push(todos.split('\n')[i])

  return user
} ,addUserTodo = async function (userId,user_lang,todo,todo_file){
  try {
    // console.log("addUser debut")
    let todolist = await read_file(todo_file),taille_bd = todolist.length;
    let temp = multi_add(userId,todo,user_lang).todos
    // console.log("todo = ",todo)
    if(taille_bd){
      for(let user of todolist){
        if(user.chat_id == userId){
          if (Array.isArray(todo)) {console.log("array");user.todos = todo; saveTodo(todolist); return}
          user.todos = user.todos.concat(temp)
          //user.todos.push(todo)
          saveTodo(todolist)
          console.log("addUserTodo invoked, user found in db")
          return
        }
      }
      todolist.push(multi_add(userId,todo,user_lang))
      // todolist.push({chat_id:userId,lang:user_lang,todos:[todo]})
      saveTodo(todolist)
      console.log("todolist2 = ",todolist)
      console.log("addUserTodo invoked, user was not found new adding ")
      return
    }else{
      todolist.push( multi_add(userId,todo,user_lang) )
      // todolist.push({chat_id:userId,lang:user_lang,todos:[todo]})
      console.log("addUserTodo invoked, empty db first adding")
      saveTodo(todolist)
      return 

    }
  
  

  } catch (error) {
    let todolist = await read_file(todo_file),taille_bd = todolist.length;
    console.error('addUser error = ', error.message)
    if(taille_bd){
      for(let user of todolist){
        if(user.chat_id == userId){
          if (Array.isArray(todo)) {user.todos = todo; saveTodo(todolist); return}
          user.todos = user.todos.concat(temp)
          //user.todos.push(todo)
          saveTodo(todolist)
          console.log("addUserTodo invoked, user found in db")
          return
        }
      }
      console.log("Updated invoked, user was not found new adding ")
      return
    }else{
      todolist.push( multi_add(userId,todo,user_lang) )
      // todolist.push({chat_id:userId,lang:user_lang,todos:[todo]})
      console.log("Updated invoked, empty db first adding")
      saveTodo(todolist)
      return 

    }
  }
  
}, addNewComer = async function(userId,todo_file){
  try {
    let todolist = await read_file(todo_file);
    console.log("todolist = ",todolist)
    todolist.push({chat_id:userId,lang:"undefined",todos:[]})
    saveTodo(todolist) // on l'insère dans le fichier (la bd)
    console.log("addNewComer invoked")
    return
  } catch (error) {
    console.error("addNewComer error : ",error)
    return
  }
}

module.exports = {
saveTodo,
getUserLang,
getUserTodos,
read_file,
todo_file,
addUserTodo,
addNewComer,
fs
}