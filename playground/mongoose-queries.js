const {ObjectID} = require ('mongodb');
const {mongoose} = require ('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo');
const {User} = require ('./../server/models/user');

// let id = '5c7e6f88644d10314caba91311';
// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// Todo.find({
//     _id: id
// }).then(todos => {
//     console.log('Todos: ', todos);
// });

// Todo.findOne({
//     _id: id
// }).then(todo => {
//     console.log('Todo: ', todo);
// });

// Todo.findById(id)
//     .then(todo =>{ 
//         if (!todo) {
//             return console.log('Id not found');
//         }
//         console.log('Todo by id: ', todo)
//     }).catch(e => console.log(e));

let id = '5c7ea82eb5973d0cfcf69fbc'

User.findById(id)
    .then(user =>{ 
        if (!user) {
            return console.log('Unable to find user');
        }
        console.log('User by id: ', user)
    }).catch(e => console.log(e));