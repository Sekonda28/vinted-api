const express = require("express");
const router = express.Router();

const User = require("../models/User");
const generateSaltAndHash = require("../middleware/saltAndHash");

const savePicture = require("../middleware/savePicture");

router.post("/user/signup", async (req, res) => {
  try {
    if (req.fields.username === undefined) {
      res.status(400).json({ message: "You need to enter a username!" });
    } else {
      const emailToCheck = await User.findOne({ email: req.fields.email });
      const usernameToCheck = await User.findOne({
        account: { username: req.fields.username },
      });
      if (emailToCheck || usernameToCheck) {
        res.status(400).json({ message: "Username or email already in use!" });
      } else {
        const credentials = generateSaltAndHash(req.fields.password); //imported module

        const newUser = new User({
          email: req.fields.email,
          account: {
            username: req.fields.username,
            phone: req.fields.phone,
          },
          token: credentials[0],
          hash: credentials[1],
          salt: credentials[2],
        });
        await newUser.save();

        if (req.files.picture) {
          newUser.account.avatar = await savePicture(
            req.files.picture.path,
            newUser.id,
            "/vinted/users"
          );
        }
        res.status(200).json({
          _id: newUser.id,
          token: newUser.token,
          account: newUser.account,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const reqUser = await User.findOne({ email: req.fields.email });
    if (!reqUser) {
      res.status(400).json({ message: "User account not found" });
    } else {
      const credentials = generateSaltAndHash(
        req.fields.password,
        reqUser.salt
      ); //pass existing salt to the function

      //validate that email and has match account
      if (
        reqUser.email === req.fields.email &&
        credentials[1] === reqUser.hash
      ) {
        reqUser.token = credentials[0];
        await reqUser.save();
        res.status(200).json({
          _id: reqUser._id,
          token: reqUser.token,
          account: reqUser.account,
        });
        res.status(400).json({
          message: "Your email or password are incorrect. Please try again",
        });
      } else {
        res
          .status(400)
          .json({ message: "Password incorrect.  Please try again" });
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
