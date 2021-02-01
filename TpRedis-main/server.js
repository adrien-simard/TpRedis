const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const port = 3000
const User = require("./models/user");
const jwt = require("jsonwebtoken")
const JWT_SECRET = 'IDUU'
const redis = require("redis");
const client = redis.createClient();
const controller = require("./controllers/user");

client.on("error", function(error) {
    console.error(error);
  });

app.use(bodyParser.json())


app.get('/incrToken', (req, res) =>{
    const token = req.header('Authorization').replace('Bearer ', '')
    
    try{
        const payload = jwt.verify(token, JWT_SECRET) 
        
        client.get(token, (err, result) => {

            if (result !== null && result >= 10) {
                res.send('Trop de connexion,attendez un peu svp')
            } else {
                client.incr(token, (err, value) => {
                    if (err) {
                        console.error(err)
                        res.send(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
                    }
    
                    // It is not the best algorithm but every 10 minutes, you'll be given 10 more shots
                    if (value === 1) client.expire(token, 10)
                    res.send('L incrémentation a bien été effectuée')
                })
            }
        })

    } catch(error) {
        console.error(error.message)
        res.send('Vous n avez pas accès !')
    }
})


app.get('/testToken', (req, res) =>{
    const token = req.header('Authorization').replace('Bearer ', '')
    
    try{
        const payload = jwt.verify(token, JWT_SECRET) 
        res.send('Autorisation fait avec succès')
    } catch(error) {
        console.error(error.message)
        res.send('Vous n\'avez pas accès !')
    }
})

app.post('/login', async (req, res) => {
    
    const user = await User.findOne({ email: req.body.email })


    if (!user || !user.comparePassword2(req.body.password)) {
        res.send('Le mot de passe est incorrecte')
    }

    else {
        const token = jwt.sign({ email: user.email, password: user.password }, JWT_SECRET, { expiresIn: '1 week' })
        client.set(token,0)
        res.send(token)
    }
 
})


app.get('/createUserTest', (req, res) => {
    // create a user a new user
    var testUser = new User({
        name: 'Jean',
        surname: 'Soquet',
        email: 'Soquet@gmail.com',
        password: 'Password123'
    });

    // save user to database
    testUser.save(function (err) {
        if (err) throw err;
    });

    res.send('Le user est bien enregistrer :)')
})

app.post('/createUser', (req, res) => {
   controller.create(req,res);
})

app.get('/readUsers',(req, res) => {
    controller.reads(req,res);
 })

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

    res.send('Test du mot de passe effectué')
    
})


app.get('/', (req, res) => {
  res.send('Le serveur est lancé !')
})

var mongoose = require('mongoose');

var connStr = 'mongodb://localhost:27017/mongoose-bcrypt-test';
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

app.listen(port, () => {
  console.log('App listening at http://localhost:${port}')
})
