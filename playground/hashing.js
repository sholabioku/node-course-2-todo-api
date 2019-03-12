const {SHA256} = require ('crypto-js');
const jwt = require ('jsonwebtoken');

let data = {
    id: 10
};

let token = jwt.sign(data, '123abc!');
console.log('Token: ', token);
let decoded = jwt.verify(token, '123abc!');
console.log('Decoded: ', decoded);

// let message = 'I am user number 3';
// let hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// let data = {
//     id: 4
// }

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecrets').toString(),
// };


// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// let resultHash = SHA256(JSON.stringify(token.data) + 'somesecrets').toString();
// if (resultHash === token.hash) {
//     console.log('Result was not changed');
// } else {
//     console.log('Result was changed, do not trust!');
// }