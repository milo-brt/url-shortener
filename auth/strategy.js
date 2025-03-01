import CustomStrategy from "passport-custom";
import User from "../models/user.js";

const idpStrategy = new CustomStrategy(async function verify(req, done) {
    if (!req.query.t) {
      return done(null, false);
    } else {
      const idpRequest = await fetch(
        "https://idp.milobrt.fr/user" +
          "?u=" +
          encodeURIComponent(req.cookies.session) +
          "&t=" +
          encodeURIComponent(req.query.t) +
          "&s=" +
          encodeURIComponent(process.env.URL_IDP_ID) +
          "&c=" +
          encodeURIComponent(process.env.URL_IDP_SECRET),
        {
          method: "GET",
        },
      ).catch((err) => done(err));
      switch (idpRequest.status) {
        case 200: {
          let user = await idpRequest.json().then((data) => {
            return data.user;
          });
          let account = await User.findOne({ idpId: user._id });
          if (!account) {
            account = await User.create({
              idpId: user._id,
              ticket: req.query.t,
            });
          } else {
            account.ticket = req.query.t;
            account.session = req.cookies.session;
            await account.save();
          }
          delete user._id, user.createdAt;
          return done(null, Object.assign(account.toObject(), user));
        }

        case 400:
          return done(null, false, { message: "" });

        case 403:
          return done(null, false, {
            message:
              "You're not allowed to access this app! If you believe this is an error please contact us at support@idp.milobrt.fr",
          });

        default:
          return done(null, false, { message: "IDP Auth failed" });
      }
    }
  })

export default idpStrategy;