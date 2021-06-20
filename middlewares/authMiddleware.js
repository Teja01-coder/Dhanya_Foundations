const jwt = require('jsonwebtoken')
const Student = require('../models/Student')
const Admin = require('../models/Admin')

const checkAdmin = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, 'dhyana foundation', async (err, decodedToken) => {
            if (err) {
                console.log(err)
                next()
            } else {
                let user = await Admin.findById(decodedToken.id)
                if (user) {
                    next()
                } else {
                    res.redirect('/admin')
                }
            }
        })
    } else {
        res.redirect('/admin')
    }
}

const availability = async (_, res, next) => {
    const morning = await Student.find({ session: 'm' })
    const evening = await Student.find({ session: 'e' })

    res.locals.morning = morning.length
    res.locals.evening = evening.length

    next()
}

const approvals = async (_, res, next) => {
    const students = await Student.find({})

    if (students) {
        res.locals.students = students
        next()
    } else {
        res.locals.students = null
        next()
    }
}

module.exports = { checkAdmin, approvals, availability }

