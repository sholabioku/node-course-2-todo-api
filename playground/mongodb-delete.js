const {MongoClient, ObjectID} = require ('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp',{ useNewUrlParser: true }, (err, client) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');
    const db = client.db('TodoApp')

    // DeleteMany
    // db.collection('Todos').deleteMany({text: 'Eat lunch'}).then( result => console.log(result));

    // db.collection('Users').deleteMany({name: 'Lukman'}).then( result => console.log(result));

    // // DeleteOne
    // db.collection('Todos').deleteOne({text: 'Eat lunch'}).then( result => console.log(result));

    // findOneAndDelete
    // db.collection('Todos').findOneAndDelete({completed: false}).then( result => console.log(result));

    db.collection('Users').findOneAndDelete({
        _id: new ObjectID("5c7d212f1350180498bf445c")
    }).then( result => console.log(JSON.stringify(result, undefined, 2)));



    // client.close();
});