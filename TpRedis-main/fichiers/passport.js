const passport = require('passport')
const {ExtractJwt, Strategy } = require('passport-jwt')
const JWT_SECRET = require( '../fichiers/secret.js')
const User = require( '../models/user.js')

// Configure passport authentication with jwt
passport.use(new Strategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
    session: false,
    // No issuer and audience because, once again, best practice goes brrr :)
}, async (jwtPayload, done) => {
    try {
        const user = await User.findOne({_id: jwtPayload.id})
        console.log(user)
        done(null, user || false)
    } catch (err) {
        return done(err, false)
    }
}))

passport.serializeUser((user, done) => {
    done(null, user.toObject());
})

passport.deserializeUser((user, done) => {
    done(null, new User(user));
})

module.exports = passport;