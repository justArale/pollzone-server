const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Fan = require("../models/Fan.model.js");
const Creator = require("../models/Creator.model");

const router = express.Router();
const { isAuthenticated } = require("../middleware/jwt.middleware.js");
const saltRounds = 10;

// POST /auth/signup - Creates a new fan or creator in the database
router.post("/signup", async (req, res, next) => {
  const { email, password, name, role, category } = req.body;

  if (
    email === "" ||
    password === "" ||
    name === "" ||
    !role ||
    (role === "creators" && !category)
  ) {
    res
      .status(400)
      .json({ message: "Provide email, password, name, and role" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  try {
    // Check if the email already exists in either Fan or Creator collections
    const foundFan = await Fan.findOne({ email });
    const foundCreator = await Creator.findOne({ email });

    if (foundFan || foundCreator) {
      res.status(400).json({ message: "User with this email already exists." });
      return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const Model = role === "creators" ? Creator : Fan;
    const createdUser = await Model.create({
      email,
      password: hashedPassword,
      name,
      role,
      category,
    });

    const { _id } = createdUser;
    const user = { email, name, _id, role, category };
    res.status(201).json({ user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST /auth/login - Verifies email and password and returns a JWT for Fan or Creator
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(401).json({ message: "All inputs are required!" });
    return;
  }

  const findUser = (Model) => {
    return Model.findOne({ email }).then((foundUser) => {
      if (!foundUser) {
        return null;
      }
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
      if (passwordCorrect) {
        const { _id, email, name, role } = foundUser;
        const payload = { _id, email, name, role };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });
        return { authToken };
      } else {
        return null;
      }
    });
  };

  Promise.all([findUser(Fan), findUser(Creator)])
    .then((results) => {
      const result = results.find((res) => res !== null);
      if (result) {
        return res.status(200).json(result);
      } else {
        return res
          .status(401)
          .json({ message: "Unable to authenticate the fan/creator" });
      }
    })
    .catch((err) => {
      console.error("Login error: ", err);
      return res.status(500).json({ message: "Internal Server Error" });
    });
});

// GET /auth/verify - Used to verify JWT stored on the client
router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload);
  res.status(200).json(req.payload);
});

module.exports = router;
