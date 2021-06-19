const { Router } = require("express");
const jwt = require('jsonwebtoken')
const Student = require("../models/Student");
const Admin = require("../models/Admin");

const router = Router();

const BATCHES = {
    number: 35,
    //batch: [
        //["AS", "AT"],
        //["AU", "AV"],
        //["AW", "AW"],
        //["BA", "BB"],
        //["BC", "BD"]
    //]
    morning: ["AS", "AU", "AW", "BA", "BC"],
    evening: ["AT", "AV", "AX", "BB", "BD"]
}

const handleErrors = (err) => {
  let errors = { email: "", password: "" };

  if (err.message === "Incorrect Email") {
    errors.email = err.message;
    return errors;
  }

  if (err.message === "Incorrect Password") {
    errors.password = err.message;
    return errors;
  }

  return errors;
};

const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) =>
  jwt.sign({ id }, "dhyana foundation", {
    expiresIn: maxAge,
  });

const register_get = (_, res) => {
  res.render("adminlogin");
};

const register_post = async (req, res) => {
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

    const id = session === 'm' ? BATCHES.morning[0] : BATCHES.evening[0]
    const allCount = session === 'm' ? await Student.find({ session: 'm' }) : await Student.find({ session: 'e' })

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
      session,
      batch: "35",
      code: id + `${allCount + 1}`.padStart(4, '0')
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
    const { email, password } = req.body
  try {
    const admin = await Admin.login(email, password);
    if (admin) {
      const token = createToken(admin._id);
      res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
      res.status(200).json({ student: admin._id });
    } else {
      throw Error("You are not an Admin");
    }
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

router.get("/register", register_get);
router.post("/register", register_post);
router.get("/admin", admin_get);
router.post("/admin", admin_post);

module.exports = router;
