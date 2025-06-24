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
    if (!findUser) throw new Error("user not found");
    done(null, findUser);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new Strategy(async (username, password, done) => {
    try {
      const findUser = await User.findOne({ username: username.toLowerCase() });
      if (!findUser) throw new Error("user not found");

      if (!comparePassword(password, findUser.password)) {
        throw new Error("Bad Password");
      }

      done(null, findUser);
    } catch (err) {
      done(err, null);
    }
  })
);

export default passport; 