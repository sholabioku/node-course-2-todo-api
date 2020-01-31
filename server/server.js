require('./config/config');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, async (req, res) => {
  try {
    const todo = new Todo({
      text: req.body.text,
      _creator: req.user._id,
    });
    const doc = await todo.save();
    res.send(doc);
  } catch (e) {
    res.status(400).send({
      error: e,
    });
  }
});

app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({
      _creator: req.user._id,
    });
    res.send({
      todos,
      message: 'Todos were fetched successfully',
    });
  } catch (e) {
    res.status(400).send({
      error: e,
    });
  }
});

app.get('/todos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send({
        message: 'Invalid ID',
      });
    }
    const todo = await Todo.findOne({
      _id: id,
      _creator: req.user._id,
    });
    if (!todo) {
      return res.status(404).send({
        message: 'Todo not found',
      });
    }
    res.send({
      todo,
      message: 'Todo was fetched successfully',
    });
  } catch (e) {
    return res.status(400).send({
      error: e,
    });
  }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send({
        message: 'Invalid ID',
      });
    }
    const todo = await Todo.findOneAndDelete({
      _id: id,
      _creator: req.user._id,
    });
    if (!todo) {
      return res.status(404).send({
        message: 'Todo not found',
      });
    }
    res.status(200).send({
      todo,
      message: 'Todo was deleted',
    });
  } catch (e) {
    res.status(404).send({
      error: e,
    });
  }
});

app.patch('/todos/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const body = _.pick(req.body, ['text', 'completed']);
    if (!ObjectID.isValid(id)) {
      return res.status(404).send({
        message: 'Invalid ID and Update failed',
      });
    }
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }
    const todo = await Todo.findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: body },
      { new: true },
    );
    if (!todo) {
      return res.status(404).send({
        message: 'ID not found and update failed',
      });
    }
    res.send({
      todo,
      message: 'Todo updated successfully',
    });
  } catch (e) {
    res.status(400).send({
      error: e,
    });
  }
});

app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = new User(body);
    await user.save();
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (e) {
    res.status(400).send({
      message: 'User already exist',
    });
  }
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send({
      user,
      message: 'User login successfully',
    });
  } catch (e) {
    res.status(400).send({
      error: e,
      message: 'User does not exist',
    });
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token);
    res.status(200).send({
      message: 'User logged out successfully',
    });
  } catch (e) {
    res.status(400).send({
      message: 'User does not exist',
    });
  }
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
