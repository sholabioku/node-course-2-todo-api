let {User} = require('./../models/user');

let authenticate = (req, res, next) => {
    let token = req.header('x-auth');

    User.findByToken(token)
        .then((user) => {
            if (!user) {
            return  res.status(401).send({
                message: 'User is not authorized'
            });
            // return Promise.reject({
            //     message: 'User does not exist'
            // });

            }

            req.user = user;
            req.token = token;
            next();

        }).catch((err) => {
            res.status(401).send({
                message: 'Authentication failed'
            });
        });
};


module.exports = {authenticate};