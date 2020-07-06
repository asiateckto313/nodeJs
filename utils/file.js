const todo_file = './todos.txt',
    checked_file = __dirname + 'checked.json';

let jsonfile = require('jsonfile'),  fs = require("fs"), todoUtils = require("./todo")


saveTodo =   function(todolist){
  try {
    fs.open(todo_file, 'w', (err, fd) => {
      if (err) throw err;
      fs.appendFile(fd, JSON.stringify(todolist), 'utf8', (err) => {
        fs.close(fd, (err) => {
          if (err) throw err;
        });
        if (err) throw err;
      });
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
       resolve(JSON.parse(data))

    }
})
  })
}, getUserLang = async function(userId,todo_file){
  try {
    let datas = await read_file(todo_file),taille = datas.length;
    for(let i = 0; i< taille; i++)
      if(datas[i].chat_id == userId)
        return {error:false,data:datas[i].lang}
    console.log(result)
  } catch (error) {
    return {error:true,error_msg:error}
  }
    return {error:false, data:"Nothing"}
  
}

module.exports = {
saveTodo,
getUserLang,
fs
}