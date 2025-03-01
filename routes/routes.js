import express from "express";
import session from "express-session";
import passport from "passport";
import User from "../models/User.js";
import Link from "../models/Link.js";
import strategy from "../auth/strategy.js";

const router = express.Router();

function generateHandle() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

passport.use("idp", strategy);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user.idpId);
  });
});

passport.deserializeUser(async function (idpId, cb) {
  process.nextTick(async function () {
    User.findOne({ idpId })
      .then(async (result) => {
        const idpRequest = await fetch(
          "https://idp.milobrt.fr/user" +
            "?u=" +
            encodeURIComponent(result.session) +
            "&t=" +
            encodeURIComponent(result.ticket) +
            "&s=" +
            encodeURIComponent(process.env.URL_IDP_ID) +
            "&c=" +
            encodeURIComponent(process.env.URL_IDP_SECRET),
          {
            method: "GET",
          },
        ).catch((err) => cb(err));
        switch (idpRequest.status) {
          case 200: {
            let user = await idpRequest.json().then((data) => {
              return data.user;
            });
            delete user._id, user.createdAt;
            return cb(null, Object.assign(result.toObject(), user));
          }

          case 400:
            return cb(null, false, { message: "" });

          case 403:
            return cb(null, false, {
              message:
                "You're not allowed to access this app! If you believe this is an error please contact us at support@idp.milobrt.fr",
            });

          default:
            return cb(null, false, { message: "IDP Auth failed" });
        }
      })
      .catch((err) => cb(err));
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated() || req.path.startsWith("/api/")) {
    return next();
  }
  return res.redirect("/urls/login/idp");
}

function ensureApiAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).send({ message: "You are not authenticated" });
}

router.use(
  "/urls",
  session({
    secret: process.env.TOKEN_KEY,
    resave: false,
    saveUninitialized: false,
  }),
);

router.use("/urls", passport.initialize());
router.use("/urls", passport.session());

router.get(
  "/urls/login/idp",
  passport.authenticate("idp", {
    failureRedirect:
      "https://idp.milobrt.fr/login?service=" + process.env.URL_IDP_ID,
  }),
);
router.get("/urls/sso", function (req, res, next) {
  passport.authenticate("idp", function (err, user, info) {
    if (info) {
      return res.send(info.message);
    }
    if (!user) {
      return res.redirect(
        "https://idp.milobrt.fr/login?service=" + process.env.URL_IDP_ID,
      );
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/urls");
    });
  })(req, res, next);
});

router.use("/urls", ensureAuthenticated);
router.get("/urls", (req, res) => {
  res.render("index-url", { user: req.user });
});
router.use("/urls/logout", ensureAuthenticated);
router.post("/urls/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    return res.send("Logged out");
  });
});

router.use("/urls/api/*", ensureApiAuthenticated);
router
  .route("/urls/api/links")
  .get(async (req, res, next) => {
    try {
      let links = await Link.find({
        $or: [{ owner: req.user._id }, { shared: true }],
      }).select("-__v -_id");
      return res.json(links);
    } catch (err) {
      return next(err);
    }
  })
  .post(async (req, res, next) => {
    try {
      if (req.user.groups.includes(process.env.DEMO_GROUP)) {
        return res
          .status(403)
          .json({ message: "This is a demo account, you can't create links!" });
      }
      if (!req.body.url)
        return res.status(400).json({ message: "URL is required" });
      try {
        new URL(req.body.url);
      } catch {
        return res.status(400).json({ message: "Invalid URL" });
      }
      if (!req.body.handle) {
        let unique = false;
        while (!unique) {
          let handle = generateHandle();
          let link = await Link.findOne({ handle });
          if (!link) {
            req.body.handle = handle;
            unique = true;
          }
        }
      } else {
        let link = await Link.findOne({ handle: req.body.handle });
        if (link)
          return res.status(400).json({ message: "Handle already in use" });
      }
      let link = new Link({
        url: req.body.url,
        handle: req.body.handle,
        owner: req.user._id,
      });
      await link.save();
      link = link.toObject();
      delete link.__v;
      delete link._id;
      return res.json(link);
    } catch (err) {
      return next(err);
    }
  });

router
  .route("/urls/api/links/:handle")
  .delete(async (req, res, next) => {
    try {
      if (req.user.groups.includes(process.env.DEMO_GROUP)) {
        return res.status(403).json({
          message: "This is a demo account, you can't deactivate links!",
        });
      }
      let link = await Link.findOne({ handle: req.params.handle });
      if (!link) return res.status(404).json({ message: "Link not found" });
      link.active = false;
      await link.save();
      return res.json({ message: "Link deactivated" });
    } catch (err) {
      return next(err);
    }
  })
  .put(async (req, res, next) => {
    try {
      if (req.user.groups.includes(process.env.DEMO_GROUP)) {
        return res.status(403).json({
          message: "This is a demo account, you can't activate links!",
        });
      }
      let link = await Link.findOne({ handle: req.params.handle });
      if (!link) return res.status(404).json({ message: "Link not found" });
      link.active = true;
      await link.save();
      return res.json({ message: "Link activated" });
    } catch (err) {
      return next(err);
    }
  });

router.route("/*").get(async (req, res, next) => {
  try {
    const handle = req.path.slice(1);
    let link = await Link.findOne({ handle });
    if (link && link.active) {
      link.hits++;
      await link.save();
      return res.redirect(link.url);
    } else {
      res.status(404);
      return res.render("404");
    }
  } catch (err) {
    console.log("Caught");
    return next(err);
  }
});

router.use((err, req, res) => {
  console.error("[URL Shortener Error]\n", err.stack);
  res.status(500).send("500 - The server is on fire!");
});

export default router;
