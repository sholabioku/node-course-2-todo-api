const _ = require ('lodash');
const expect = require ('expect');
const request = require ('supertest');
const {ObjectID} = require ('mongodb');

const {app} = require ('./../server');
const {Todo} = require ('./../models/todo');
const {User} = require ('./../models/user');
const {todos, populateTodos, users, populateUsers} = require ('./seed/seed');


beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {
  it('should create a new todo', async () => {
      let text = 'Test todo text';

    const res = await request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({text});
    expect(res.status).toBe(200);
    expect(res.body.text).toBe(text);

    const todos = await Todo.find({text});
    expect(todos.length).toBe(1);
    expect(todos[0].text).toBe(text);

    });

  it('should not create todo with invalid data', async () => {

    const res = await request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({});
    expect(res.status).toBe(400);

    const todos = await Todo.find();
    expect(todos.length).toBe(2);

  });
});


describe('GET /todos', () => {
//   it('should get all todos', (done) => {
//     request(app)
//         .get('/todos')
//         .set('x-auth', users[0].tokens[0].token)
//         .expect(200)
//         .expect((res) => {
//             expect(res.body.todos.length).toBe(1);
//         })
//         .end(done);
//   });
  it('should get all todos', async () => {
    const res = await request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token);
        expect(res.status).toBe(200);
        expect(res.body.todos.length).toBe(1);

  });
});

describe('GET /todos/:id', () => {
//   it('should return todo doc', (done) => {
//       let id = todos[0]._id.toHexString();
//       request(app)
//         .get(`/todos/${id}`)
//         .set('x-auth', users[0].tokens[0].token)
//         .expect(200)
//         .expect((res) => {
//             expect(res.body.todo.text).toBe(todos[0].text)
//         })
//         .end(done)
//   });
  it('should return todo doc', async () => {
      let id = todos[0]._id.toHexString();
      const res = await request(app)
        .get(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token)
        expect(res.status).toBe(200);
        expect(res.body.todo.text).toBe(todos[0].text);
  });

  it('should not return todo doc created by other user', async () => {
      let id = todos[1]._id.toHexString();
      const res = await request(app)
        .get(`/todos/${id}`)
        .set('x-auth', users[0].tokens[0].token);
        expect(res.status).toBe(404);
  });

//   it('should return 404 if todo not found', (done) => {
//      let hexId = new ObjectID().toHexString();
//      request(app)
//         .get(`/todos/${hexId}`)
//         .set('x-auth', users[0].tokens[0].token)
//         .expect(404)
//         .end(done)
//   });


  it('should return 404 if todo not found', async () => {
     let hexId = new ObjectID().toHexString();
     const res = await request(app)
        .get(`/todos/${hexId}`)
        .set('x-auth', users[0].tokens[0].token);
        expect(res.status).toBe(404);
  });

  it('should return 404 for non-object ids', async () => {
      const res = await request(app)
        .get('/todos/123abc')
        .set('x-auth', users[0].tokens[0].token);
        expect(res.status).toBe(404);

  });

});


describe('DELETE /todos/:id', () => {
    it('should remove a todo', async () => {
        let hexId = todos[1]._id.toHexString();

        const res = await request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token);
            expect(res.status).toBe(200);
            expect(res.body.todo._id).toBe(hexId);

                //Query database using findById toNotexist
                //Expect(null).toNotExist()
            const todo = await Todo.findById(hexId)
            expect(todo).toBeFalsy();

    });

    it('should remove a todo', async () => {
        let hexId = todos[0]._id.toHexString();
  
        const res = await request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token);
            expect(res.status).toBe(404);
              //Query database using findById toExist
              //Expect(null).toNotExist()
            const todo = await Todo.findById(hexId);
            expect(todo).toBeTruthy();

    });

  it('should return 404 if todo not found', async () => {
    let hexId = new ObjectID().toHexString();

    const res = await request(app)
        .delete(`/todos/${hexId}`)
        .set('x-auth', users[1].tokens[0].token);
        expect(res.status).toBe(404);

  });

  it('should return 404 if object ID not found', async () => {
    const res = await request(app)
        .delete('/todos/123abc')
        .set('x-auth', users[1].tokens[0].token)
        expect(res.status).toBe(404);

  });

});


describe('PATCH /todo/:id', () => {
    it('should update the todo', async () => {
        //Grap id of first item
        let hexId = todos[0]._id.toHexString();
        //update text, set completed true
        let text = 'This should be new text'
        const res = await request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                completed: true,
                text
            });
        //assert 200
        expect(res.status).toBe(200);
        //verify:text is changed, completed is true, completedAt is a number
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
  });

    it('should not update the todo created by other user', async () => {
        //Grap id of first item
        let hexId = todos[0]._id.toHexString();
        //update text, set completed true
        let text = 'This should be new text'
        const res = await request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                completed: true,
                text
            });
        //assert 404
        expect(res.status).toBe(404);
  });

  it('should clear completedAt when to do is not completed', async () => {
        //Grap id of second todo item
        let hexId = todos[1]._id.toHexString();
        //update text, set completed false
        let text = 'This should be seconde todo it'
        const res = await request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                completed: false,
                text
            });
        //200
        expect(res.status).toBe(200);
        //text is changed, completed is false, completedAt is null
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeNull();
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', async () => {
        const res = await request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);

    });

    it('should return 401 if not authenticated', async () => {
        const res = await request(app)
            .get('/users/me');
        expect(res.status).toBe(401);
        expect(res.body).toEqual({});
    });
});


describe('POST /users', () => {
    it('should create a user ', async () => {
        let email = 'sholabioku@gmail.com';
        let password = '123abc!';
        let user;

        const res = await request(app)
            .post('/users')
            .send({email, password})
        expect(res.status).toBe(200);
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);

        user = await User.findOne({email});
        expect(user).toBeTruthy();
        expect(user.password).not.toBe(password);
    });

    it('should return validation error if request invalid', async () => {
        const res = await request(app)
            .post('/users')
            .send({
                email: 'and',
                password: '123'
            });
        expect(res.status).toBe(400);
    });


    it('should not create user if email is already in use', async () => {
        const res = await request(app)
            .post('/users')
            .send({
            email: users[0].email,
            password: 'Password123!'
            });
        expect(res.status).toBe(400);

    });

});


describe('POST /users/login', () => {
    it('should login user and return token', async () => {
        const res = await request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            });
        expect(res.status).toBe(200);
        expect(res.headers['x-auth']).toBeTruthy();

        const user = await User.findById(users[1]._id);
        expect(user.tokens[1]).toMatchObject({
            access: 'auth',
            token: res.headers['x-auth']
        });

    });

    it('should return invalid login', async () => {

        const res = await request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password + '1'
            });
        expect(res.status).toBe(400);
        expect(res.headers['x-auth']).toBeFalsy();

        const user = await User.findById(users[1]._id);
        expect(user.tokens.length).toBe(1);

    });

});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', async () => {
        const res = await request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token);
        expect(res.status).toBe(200);

        const user = await User.findById(users[0]._id);
        expect(user.tokens.length).toBe(0);

    });
});




