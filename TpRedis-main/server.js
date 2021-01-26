
const bodyParser = require ('body-parser')
const express = require('express')
const jwt = require('jsonwebtoken')
const user = require('./models/user')
const JWT_SECRET = require ('./fichiers/secret')
const passport = require ('./fichiers/passport')
const app = express()


app.use(bodyParser.json())
app.use(passport.initialize())
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

    

app.get('/login', (req, res) => {
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
    
    const token = jwt.sign({email: user.email, password:user.password}, JWT_SECRET, { expiresIn: '1 week' })

    res.send(token)
})


app.get('/', passport.authenticate('jwt'), function (req, res){
    res.json(req.user)
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});
