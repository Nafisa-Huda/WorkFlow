import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { User } from '../models/User.js'

// The minimal user shape attached to req.user on authenticated requests.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: string
      name: string
      email: string
    }
  }
}

const INVALID_CREDENTIALS = 'Invalid email or password'

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
      // Same message for unknown email and wrong password, so the login form
      // can't be used to discover which emails have accounts.
      if (!user || !(await user.verifyPassword(password))) {
        return done(null, false, { message: INVALID_CREDENTIALS })
      }
      return done(null, { id: user.id, name: user.name, email: user.email })
    } catch (err) {
      return done(err)
    }
  }),
)

passport.serializeUser((user, done) => done(null, user.id))

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).lean()
    done(null, user ? { id: String(user._id), name: user.name, email: user.email } : false)
  } catch (err) {
    done(err)
  }
})

export default passport
