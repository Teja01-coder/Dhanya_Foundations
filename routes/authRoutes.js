const { Router } = require("express");
const Student = require("../models/Student");

const router = Router();

const signup_get = (_, res) => {
  res.render("adminlogin");
};

const signup_post = async (req, res) => {
  const {
    name,
    address,
    city,
    age,
    phone,
    bloodGroup,
    healthRecord,
    introducedBy,
    introducerName,
    introducerRegistration,
    designation,
    qualification,
    session
  } = req.body;

  try {
    const user = await Student.create({
      name,
      address,
      city,
      age,
      phone,
      bloodGroup,
      healthRecord,
      introducedBy,
      introducerName,
      introducerRegistration,
      designation,
      qualification,
      session
    });

    res.status(201).json({ user: user._id });
  } catch (err) {
    console.log(err);
  }
};

const admin_get = (_, res) => {
  res.render("adminlogin");
};

const admin_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    if (user.isAdmin) {
      const token = createToken(user._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });

      res.status(200).json({ user: user._id });
    } else {
      throw Error("You are not an Admin");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

router.get("/register", signup_get);
router.post("/register", signup_post);
router.get("/admin", admin_get);
router.post("/admin", admin_post);

module.exports = router;
