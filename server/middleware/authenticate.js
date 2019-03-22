let {User} = require('./../models/user');

let authenticate = (req, res, next) => {
    let token = req.header('x-auth');

    User.findByToken(token)
        .then((user) => {
            if (!user) {
            // return  res.status(401).send();
            return Promise.reject({
                message: 'Auth failed'
            });

            }

            req.user = user;
            req.token = token;
            next();

        }).catch((err) => {
            res.status(401).send({
                message: 'Auth failed'
            });
        });
};


module.exports = {authenticate};