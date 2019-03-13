const _ = require ('lodash');
const expect = require ('expect');
const request = require ('supertest');
const {ObjectID} = require ('mongodb');

const {app} = require ('./../server');
const {Todo} = require ('./../models/todo');

const todos = [
    {
        _id: new ObjectID(),
        text: 'First test todo'
    },
    {
        _id: new ObjectID(),
        text: 'Second test todo',
        completed: true,
        completedAt: 333
    }
];

beforeEach((done) => {
    Todo.deleteMany({}).then(() => {
            return Todo.insertMany(todos);
        }).then(() => done());
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
      let text = 'Test todo text';

      request(app)
        .post('/todos')
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text)
        })
        .end((err, res) => {
            if (err) {
                return done(err)
            }

            Todo.find({text})
                .then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done()
                })
                .catch( e => done(e));
        });
    });

  it('should not create todo with invalid data', (done) => {

    request(app)
        .post('/todos')
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err)
            }

            Todo.find()
                .then(todos => {
                    expect(todos.length).toBe(2);
                    done()
                })
                .catch( e => done(e));
        });

  });
});


describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
        .get('/todos')
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(2);
        })
        .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
      let id = todos[0]._id.toHexString();
      request(app)
        .get(`/todos/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text)
        })
        .end(done)
  });

  it('should return 404 if todo not found', (done) => {
     let hexId = new ObjectID().toHexString();
     request(app)
        .get(`/todos/${hexId}`)
        .expect(404)
        .end(done)
  });

  it('should return 404 for non-object ids', (done) => {
      request(app)
        .get('/todos/123abc')
        .expect(404)
        .end(done)
  });

});


describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
      let hexId = todos[1]._id.toHexString();

      request(app)
        .delete(`/todos/${hexId}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(hexId);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            };

            //Query database using findById toNotexist
            //Expect(null).toNotExist()
            Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeFalsy()
                    done();
                }).catch((err) => console.log(err));
        });

  });

  it('should return 404 if todo not found', (done) => {
    let hexId = new ObjectID().toHexString();

    request(app)
        .delete(`/todos/${hexId}`)
        .expect(404)
        .end(done)

  });

  it('should return 404 if object ID not found', (done) => {
    request(app)
        .delete('/todos/123abc')
        .expect(404)
        .end(done)

  });


});


describe('PATCH /todo/:id', () => {
  it('should update the todo', (done) => {
    //Grap id of first item
    let hexId = todos[0]._id.toHexString();
    //update text, set completed true
    let text = 'This should be new text'
    request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: true,
            text
        })
    //assert 200
        .expect(200)
        .expect((res) => {
            //verify:text is changed, completed is true, completedAt is a number
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(true);
            expect(typeof res.body.todo.completedAt).toBe('number');
        })
        .end(done)
  });

  it('should clear completedAt when to do is not completed', (done) => {
    //Grap id of second todo item
    let hexId = todos[1]._id.toHexString();
    //update text, set completed false
    let text = 'This should be seconde todo it'
    request(app)
        .patch(`/todos/${hexId}`)
        .send({
            completed: false,
            text
        })
    //200
        .expect(200)
        .expect((res) => {
            //text is changed, completed is false, completedAt is null
            expect(res.body.todo.text).toBe(text);
            expect(res.body.todo.completed).toBe(false);
            expect(res.body.todo.completedAt).toBeNull();
        })

        .end(done)
  });
});


