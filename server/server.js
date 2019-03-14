require('./config/config');
const _ = require ('lodash');
const {ObjectID} = require ('mongodb');
const express = require ('express');
const bodyParser = require ('body-parser');


const {mongoose} = require ('./db/mongoose');
const {Todo} = require ('./models/todo');
const {User} = require ('./models/user');
let {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

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


app.delete('/todos/:id', (req, res) => {
    //Get the id
    let id = req.params.id;
    //Validate the id--if not valid return 404
    if (!ObjectID.isValid(id)) {
        return res.status(404).send()
    }

    //Remove todo by id
        //Success
            //If not doc-return 404 with empty body
            //If doc-return doc with 200
        //Error
            //404 with empty body
    Todo.findByIdAndDelete(id)
        .then(todo => {
            if (!todo) {
                return res.status(404).send();
            }
            res.status(200).send({todo});
        })
        .catch(err => res.status(404).send());
});


app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) { 
      return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
        }).catch((e) => {
        res.status(400).send();
        })
});


app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save()
        .then(() => {
            return user.generateAuthToken()
        }).then((token) => {
            res.header('x-auth', token).send(user);
        }).catch((err) => {
            res.status(400).send(err);
        });

});



app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch((e) => {
        res.status(400).send();
    });
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};

