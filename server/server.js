const {ObjectID} = require ('mongodb');
const express = require ('express');
const bodyParser = require ('body-parser');


const {mongoose} = require ('./db/mongoose');
const {Todo} = require ('./models/todo');
const {User} = require ('./models/user');

const app = express();
const port = process.env.PORT || 8080

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    let todo = new Todo({
        text:req.body.text
    });

    todo.save()
        .then((doc) => {
            res.send(doc)
        }).catch((err) => {
            res.status(400).send(err)
        });


});

app.get('/todos', (req, res) => {
    Todo.find()
        .then((todos) => {
            res.send({todos});
        }).catch((err) => {
            res.status(400).send(err);
        });
});


app.get('/todos/:id', (req, res) => {
    let id = req.params.id;
    //Validate id using isValid
    //404-send back empty send

    if (!ObjectID.isValid(id)) {
        return res.status(404).send()
    }

    //findById
        //Success
            //if todo-send it back
            //if no todo-send back 404 with empty body
        //Error
            //400-and send empty body back
    Todo.findById(id)
        .then((todo) => {
            if (!todo) {
                return res.status(404).send();
            }
            res.send({todo})
        }).catch((err) => {
            return res.status(400).send()
        });
});


app.listen(port, () => {
    console.log(`Started on port ${port }`);
});

module.exports = {app};

