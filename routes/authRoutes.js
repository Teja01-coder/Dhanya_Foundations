const { Router } = require("express");
const jwt = require('jsonwebtoken')
const wbm = require('wbm');
const fs = require('fs')
const Student = require("../models/Student");
const Admin = require("../models/Admin");
const { checkAdmin } = require("../middlewares/authMiddleware");

const router = Router();

const BATCHES = {
    morning: ["AS", "AU", "AW", "BA", "BC"],
    evening: ["AT", "AV", "AX", "BB", "BD"]
}

const allStudents = async (req, res) => {
    const { batch } = req.body
    try {  
        const students = await Student.find({ batch })
        res.status(200).json({ students })
    } catch (err) {
        console.log(err)
    }
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
    batch,
    address,
    city,
    age,
    phone,
    bloodGroup,
    healthRecord,
    email,
    introducerName,
    introducerPhone,
    designation,
    qualification,
    session
  } = req.body;

    const id = session === 'm' ? BATCHES.morning[(+batch - 34) % 5] : BATCHES.evening[(+batch - 34) % 5]
    const allCount = session === 'm' ? await Student.find({ session, batch }) : await Student.find({ session, batch })

  try {
    const user = await Student.create({
      name,
      address,
      city,
      age,
      phone,
      bloodGroup,
      healthRecord,
      email,
      introducerName,
      introducerPhone,
      designation,
      qualification,
      session,
      batch,
      code: id + `${allCount.length + 1}`.padStart(4, '0')
    });

    res.status(201).json({ user });
  } catch (err) {
      if (err.message.includes('duplicate')) {
          res.status(400).json({ error: "Phone no. already registered" })
      }
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

const studedit_post = async (req, res) => {
    const { type, id: _id } = req.body;
    try {
        if (type === 'DELETE') {
            const student = await Student.deleteOne({ _id })
            res.status(200).json({ msg: 'success' })
        } else if (type === 'BLOCK') {
            const student = await Student.findById(_id)
            const isBlock = student.isBlocked
            const final = await Student.findOneAndUpdate({ _id }, { isBlocked: !isBlock })
            res.status(200).json({ msg: 'success' })
        }
    } catch (err) {
        console.log(err)
        res.status(400).json({ msg: 'error' })
    }
}

const download_data = async (_, res) => {
    const data = await Student.find({})
    let csv = []
    const fields = Object.entries(Object.entries(data[0]).filter(e => e[0] === '_doc')[0][1]).map(e => `"${e[0]}"`)
    csv.push(fields.join(', '))
    for (let student of data) {
        const stud = Object.entries(student).filter(e => e[0] === '_doc')[0][1]
        const studEntries = Object.entries(stud).map(e => `"${e[1]}"`)
        csv.push(studEntries.join(', '))
    }
    csv = csv.join('\n')
    fs.writeFileSync('students.csv', csv)
    res.download('students.csv')
}

const batchDetails = async (req, res) => {
    const { type } = req.body
    try {
        let admin = await Admin.find({})
        admin = admin[0]
        if (type === "all") {
            res.status(200).json({ all: admin.batches })
        } else if (type === "closed") {
            res.status(200).json({ closed: admin.closeBatch })
        }
    } catch (err) {
        res.status(400).json({ err })
    }
}

const batchEdit = async (req, res) => {
    const { type, batch } = req.body
    try {
        if (type === 'close') {
            const admin = await Admin.findOne({ email: 'test@test.com' })
            let closed = admin.closeBatch
            if (closed.includes(batch)) {
                closed = closed.filter(e => e !== batch)
                const edit = await Admin.findOneAndUpdate({ email: 'test@test.com' }, { closeBatch: closed })
                res.status(200).json({ edit: 'Close' })
            } else {
                closed.push(batch)
                const edit = await Admin.findOneAndUpdate({ email: 'test@test.com' }, { closeBatch: closed })
                res.status(200).json({ edit: 'Open' })
            }
        } else if (type === 'add') {
            const admin = await Admin.findOne({ email: 'test@test.com' })
            const add = admin.batches
            const nextBatch = Math.max(...add.map(e => +e)) + 1
            const edit = await Admin.findOneAndUpdate({ email: 'test@test.com' }, { batches: [...add, nextBatch] })
            res.status(200).json({ nextBatch })
        }
    } catch (err) {
        res.status(400).json({ err })
    }
}

const reRegister = async (req, res) => {
    const { type, batch, found, email, phone, session } = req.body
    try {
        if (type === 'detail') {
            let stud = await Student.findOne({ email })
            if (!stud) {
                stud = await Student.findOne({ phone }) 
                res.status(200).json({ stud, found: 'phone' })
                return
            }
            res.status(200).json({ stud, found: 'email' })
        } else if (type === 'update') {
            const id = session === 'm' ? BATCHES.morning[(+batch - 34) % 5] : BATCHES.evening[(+batch - 34) % 5]
            const allCount = session === 'm' ? await Student.find({ session, batch }) : await Student.find({ session, batch })
            const code = id + `${allCount.length + 1}`.padStart(4, '0')
            if (found === 'phone') {
                let stud = await Student.findOneAndUpdate({ phone }, { batch, code })
                stud = await Student.findOne({ phone })
                res.status(200).json({ stud })
            } else if (found === 'email') {
                let stud = await Student.findOneAndUpdate({ email }, { batch, code })
                stud = await Student.findOne({ email })
                res.status(200).json({ stud })
            }
        }
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
router.post("/studedit", checkAdmin, studedit_post);
router.post("/all", checkAdmin, allStudents);
router.post("/batch", checkAdmin, batchDetails);
router.post("/closebatch", checkAdmin, batchEdit);
router.post("/reregister", reRegister);
router.get("/download", checkAdmin, download_data);

module.exports = router;
