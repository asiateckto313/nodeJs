const todo_file = __dirname+'/todos.json',
    checked_file = __dirname + 'checked.json';

let jsonfile = require('jsonfile'),  fs = require("fs"), todoUtils = require("./todo")


saveTodo =   function(todolist){
    fs.open(todo_file, 'wx', (err, fd) => {
        if (err) {
          if (err.code === 'EEXIST') {
            console.error('myfile already exists');
            return;
          }
      
          throw err;
        }else{
          console.log("fd = ",fd)
          fs.writeFileSync(todo_file,JSON.stringify(todolist));
          return;
        }
      
       
      });
   

}, updateFile = function(){

}

module.exports = {
saveTodo,
fs
}