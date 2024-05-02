// imports
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Seja bem vindo!" });
});

app.listen(3000);

// ter algo
