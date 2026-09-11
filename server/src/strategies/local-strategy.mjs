import passport from "passport";
import { Strategy } from "passport-local";
import { User } from "../models/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await User.findById(id);
    done(null, findUser || false);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findUser = await User.findOne({ username: username.toLowerCase() });
      if (!findUser) {
        return done(null, false, { message: "Invalid username or password." });
      }

      if (!comparePassword(password, findUser.password)) {
        return done(null, false, { message: "Invalid username or password." });
      }

      return done(null, findUser);
    } catch (err) {
      return done(err, null);
    }
  })
);

export default passport;
