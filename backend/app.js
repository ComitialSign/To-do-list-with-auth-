// imports
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//models
const User = require("./models/User");

const app = express();

//config express para json
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Welcome!" });
});

app.post("/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  //validation
  if (!username) {
    return res.status(422).json({ msg: "Username is required" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password is required" });
  }
  if (!confirmPassword) {
    return res.status(422).json({ msg: "Confirm the password is required" });
  }
  if (password !== confirmPassword) {
    return res.status(422).json({ msg: "The passwords needed to be the same" });
  }

  //verificar se o usuario existe
  const userExists = await User.findOne({ username: username });

  if (userExists) {
    return res.status(422).json({ msg: "Username already in use" });
  }

  //create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  //criar user
  const user = new User({
    username,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "User created with success" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ msg: "An error occurred on the server, please try again later" });
  }
});

//conectar ao banco
const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    app.listen(3000);
    console.log("connected to the base");
  })
  .catch((err) => console.log(err));
