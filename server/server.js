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

app.post('/todos', authenticate, (req, res) => {
    let todo = new Todo({
        text:req.body.text,
        _creator: req.user._id
    });

    todo.save()
        .then((doc) => {
            res.send({
                doc: doc,
                message: 'Todo created successfully'
            });
        }).catch((err) => {
            res.status(400).send({
                error: err
            });
        });


});

app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creator:req.user._id
    })
        .then((todos) => {
            res.send({
                todos: todos,
                message: 'Todos were fetch successfully'
            });
        }).catch((err) => {
            res.status(400).send({
                error: err
            });
        });
});


app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({
            message: 'Invalid ID'
        })
    }

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    })
        .then((todo) => {
            if (!todo) {
                return res.status(404).send({
                    message: 'Todo not found'
                });
            }
            res.send({
                todo: todo,
                message: 'Todo was fetched successfully'
            })
        }).catch((err) => {
            return res.status(400).send({
                error: err
            });
        });
});


app.delete('/todos/:id', authenticate, (req, res) => {

    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send({
            message: 'Invalid ID'
        });
    };

    Todo.findOneAndDelete({
        _id: id,
        _creator: req.user._id
    })
        .then(todo => {
            if (!todo) {
                return res.status(404).send({
                    message: 'Todo not found'
                });
            }
            res.status(200).send({
                todo: todo,
                message: 'Todo was deleted'
            });
        })
        .catch(err => res.status(404).send({
            error: err
        }));
});


app.patch('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

    if (!ObjectID.isValid(id)) { 
      return res.status(404).send({
          message: 'Invalid ID and Update failed'
      });
    }

    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true})
        .then((todo) => {
        if (!todo) {
            return res.status(404).send({
                message: 'ID not found and update failed'
            });
        }

        res.send({
            todo: todo,
            message: 'Todo updated successfully'
        });
        }).catch((e) => {
        res.status(400).send({
            error: e
        });
    })
});


app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);

    user.save()
        .then(() => {
            return user.generateAuthToken()
        }).then((token) => {
            res.header('x-auth', token).send({
                user: user,
                message: 'User created'
            });
        }).catch((err) => {
            res.status(400).send({
                error: err
            });
        });

});



app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send({
                user: user,
                message: 'User login successfully'
            });
        })
    }).catch((e) => {
        res.status(400).send({
            error: e,
            message: 'Auth failed'
        });
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send({
            message: 'User logged out successfully'
        })
    }, () => {
        res.status(401).send({
            message: 'Auth failed'
        });
    });
});


app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

module.exports = {app};

