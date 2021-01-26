
const bodyParser = require ('body-parser')
const express = require('express')
const app = express()

app.use(bodyParser.json())
//Access the controllers
const controller = require('./controllers/user');

const port = 3000
var mongoose = require('mongoose'),
    User = require('./models/user.js');

app.post('/createUser', (req, res) => {
    // create a user a new user
       // var testUser = new User({
         //   name: 'adrien',
           // surname: 'simars',
            //email: 'simard@gmail.com',
           // password: 'Password123'
           controller.create(req,res);
    });

    

app.get('/testMdp', (req, res) => {
    // fetch user and test password verification
    User.findOne({ email: 'simard@gmail.com' }, function (err, user) {
        if (err) throw err;

        // test a matching password
        user.comparePassword('Password123', function (err, isMatch) {
            if (err) throw err;
            console.log('Password123:', isMatch); // -> Password123: true
        });

        // test a failing password
        user.comparePassword('123Password', function (err, isMatch) {
            if (err) throw err;
            console.log('123Password:', isMatch); // -> 123Password: false
        });
    });

    res.send('Ca roule')
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});
