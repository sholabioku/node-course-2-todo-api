const {ObjectID} = require ('mongodb');
const {mongoose} = require ('./../server/db/mongoose');
const {Todo} = require ('./../server/models/todo');
const {User} = require ('./../server/models/user');

// Todo.remove({}).then(result => console.log(result));

// Todo.findByIdAndDelete('5c80c5b1c80d5c0c68486310').then(todo => console.log(todo));

Todo.findOneAndDelete({_id: '5c80c67ac80d5c0c68486312'}).then(todo => console.log(todo));
