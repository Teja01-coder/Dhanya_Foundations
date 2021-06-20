const { Router } = require("express");
const jwt = require('jsonwebtoken')
const wbm = require('wbm');
const Student = require("../models/Student");
const Admin = require("../models/Admin");



const router = Router();

const BATCHES = {
    number: 35,
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
  res.render("form");
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
      batch: `${BATCHES.number}`,
      code: id + `${allCount.length + 1}`.padStart(4, '0')
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

const message_post = async (req, res) => {
    const { msg } = req.body

    try {
        const allStudents = await Student.find({})
        const phones = allStudents.map(e => `+91${e.phone}`)
        wbm
            .start()
            .then(async () => {
                await wbm.send(phones, msg)
                await wbm.end()
                res.status(200).json({ code: 200 })
            })
            .catch(err => console.log(err))
    } catch (err) {
        console.log(err)
        res.status(400).json({ err })
    }
}

router.get("/register", register_get);
router.post("/register", register_post);
router.get("/admin", admin_get);
router.post("/admin", admin_post);
router.post("/message", message_post);

module.exports = router;
