
const bodyParser = require ('body-parser')
const express = require('express')
const jwt = require("jsonwebtoken")
const app = express()
const port = 3000
var mongoose = require('mongoose'),
    User = require('./models/user.js');
const redis = require("redis");
const client = redis.createClient();

const JWT_SECRET = "IDUU"


app.use(bodyParser.json())
//Access the controllers
const controller = require('./controllers/user');
client.on("error", function(error) {
    console.error(error);
  });


app.get('/incrToken', (req, res) =>{
    const token = req.header('Authorization').replace('Bearer ', '')
    
    try{
        const payload = jwt.verify(token, JWT_SECRET) 
        
        client.get(token, (err, result) => {

            if (result !== null && result >= 10) {
                res.send('You are rate limited, wait a bit')
            } else {
                client.incr(token, (err, value) => {
                    if (err) {
                        console.error(err)
                        res.send(StatusCodes.INTERNAL_SERVER_ERROR).json(err)
                    }
    
                    // It is not the best algorithm but every 10 minutes, you'll be given 10 more shots
                    if (value === 1) client.expire(token, 10)
                    res.send('L\'incrémentation a bien été effectuée')
                })
            }
        })

    } catch(error) {
        console.error(error.message)
        res.send('Vous n\'avez pas accès !')
    }
})

app.post('/createUser', (req, res) => {
    var testUser = new User({
        name: 'Roshan',
        surname: 'Nepaul',
        email: 'roshannep@gmail.com',
        password: 'test'
    });

    // save user to database
    testUser.save(function (err) {
        if (err) throw err;
    });

    res.send('Le user est bien enregistrer :)')
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
app.get('/testToken', (req, res) =>{
    const token = req.header('Authorization').replace('Bearer ', '')
    
    try{
        const payload = jwt.verify(token, JWT_SECRET) 
        res.send('Authorization fait avec succès')
    } catch(error) {
        console.error(error.message)
        res.send('Vous n\'avez pas accès !')
    }
})
app.post('/login', async (req, res) => {

    const user = await User.findOne({ email: req.body.email })
    console.log(req)


    if (!user || !user.comparePassword2(req.body.password)) {

        res.send('Le mot de passe est incorrecte')
    }

    else {
        const token = jwt.sign({ email: user.email, password: user.password }, JWT_SECRET, { expiresIn: '1 week' })
        client.set(token,0)
        res.send(token)
    }
})

app.post('/register', (req, res) => {
    var user = new User({
        name: req.body.name,
        firstname: req.body.surname,
        email: req.body.email,
        password: req.body.password
    });

    // save user to database
    user.save(function (err) {
        if (err) throw err;
    });

    res.send('L utilisateur est bien enregistrer :)')
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
