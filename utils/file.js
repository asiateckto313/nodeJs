
const path = require('path');
const { TODO_FILE } = require('../server');
const todo_file = path.resolve("./todos.txt");//"/Users/pablo_e/Desktop/Programmes en nodeJs/telegram_api/todos.txt",

let fs = require("fs"),

isFileExists = function (filePath) {
  try {
    if (fs.existsSync(filePath)) {
      //file exists
      return true
    }
  } catch(err) {
    return false
  }
} ,

initBd = function ( todo_file, message_file ) { 
  if (!todo_file || !message_file) {
    console.log("L'un des paramètres est manquant, veuillez renseigner les deux paramètres svp")
    return
  }
  if ( ! isFileExists( todo_file ) ) {
    // Si le fichier todo.txt n'existe pas on le crée
    fs.appendFile( todo_file , '[]' , ( err ) => {
      if ( err ) {
        console.log("erreur lors de la création du fichier : ", err)
        return
      }
      console.log(" Création du fichier réussie ")
    })
  
  }

  if ( ! isFileExists( message_file ) ) {
    // Si le fichier todo.txt n'existe pas on le crée
    fs.appendFile( message_file , '[]' , ( err ) => {
      if ( err ) {
          console.log("erreur lors de la création du fichier : ", err)
          return
      }
      console.log(" Création du fichier réussie ")
    })
  }

  console.log('InitBd invoked')
} ,
saveTodo =   function(todolist){
  try {
    fs.writeFile(todo_file, JSON.stringify(todolist), (err) => {
      if (err) console.log("We've got an error : ", err)
      console.log('The file has been saved!');
    });
    
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
    // console.log(datas[0].lang)
    if (taille){ 
       for(let i = 0; i< taille; i++)
        if(datas[i].chat_id == userId)
          return {error:false,data:datas[i].lang}
    } else { return {error:false, data:"Nothing"} }
    //console.log(result)
  } catch (error) {
    return {error:true,error_msg:error}
  }
  return {error:false, data:"Nothing"}
  
}, getUserTodos = async function(userId,todo_file_path = todo_file){
  try {
    if (typeof todo_file_path === "undefined" || todo_file_path === null
    || typeof todo_file_path !== "string" ) {
      todo_file_path = TODO_FILE
    }
    let todolist = await read_file(todo_file_path), todos = undefined,taille = todolist.length;
    
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
  if(nbLigne > 1)
    for(let i = 0; i <nbLigne; i++)
      user.todos.push(todos.split('\n')[i])
  else user = {chat_id: userId, lang: user_lang, todos: [todos]}
  return user
} ,
addUserTodo = async function (userId,user_lang,todo,todo_file){
  try {
    // console.log("addUser debut")
    let todolist = await read_file(todo_file),taille_bd = todolist.length;
    let temp = multi_add(userId,todo,user_lang).todos
    console.log("temp = ",temp)
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
}, setUserLang = async function (userId, lang) {
  try{  
    let datas = await read_file(todo_file),taille = datas.length;
    if (taille){ 
      for(let i = 0; i< taille; i++)
        if(datas[i].chat_id == userId){
          datas[i].lang = lang;
          saveTodo(datas);
          console.log("setUserLang invoked")
          break;
        }
    } else { return {error:false, data:"Nothing"} }
  } catch (e) {
    console.log("setUserLang error invoked")
    console.error(e.message)
  }
};

module.exports = {
saveTodo,
getUserLang,
getUserTodos,
read_file,
todo_file,
addUserTodo,
addNewComer,
isFileExists,
fs,
setUserLang,
initBd
}