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
  const userExist = await User.findOne({ username: username });

  if (userExist) {
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
    res
      .status(500)
      .json({ msg: "An error occurred on the server, please try again later" });
  }
});

//logar na conta
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //validação
  if (!username) {
    return res.status(422).json({ msg: "Username is required" });
  }
  if (!password) {
    return res.status(422).json({ msg: "Password is required" });
  }

  //verifica se o usuario existe
  const user = await User.findOne({ username: username });

  if (!user) {
    return res.status(422).json({ msg: "Invalid username" });
  }

  //verifica se a senha existe
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "Incorrect password" });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({ msg: "Authentication success", token });
  } catch (err) {
    res
      .status(500)
      .json({ msg: "An error occurred on the server, please try again later" });
  }
});

//vai para a pagina do usuario
app.get("/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  //Verifica se usuario existe
  const user = await User.findById(id, `-password`);

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Denied access" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (err) {
    return res.status(400).json({ msg: "Invalid token" });
  }
}

//conectar ao banco
const dbUrl = process.env.DB_URL;

mongoose
  .connect(dbUrl)
  .then(() => {
    app.listen(3000);
    console.log("connected to the base");
  })
  .catch((err) => console.log(err));
