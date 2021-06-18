const jwt = require('jsonwebtoken')
const Student = require('../models/Student')

const checkAdmin = (req, res, next) => {
    const token = req.cookies.jwt

    if (token) {
        jwt.verify(token, 'the american college', async (err, decodedToken) => {
            if (err) {
                console.log(err)
                next()
            } else {
                let user = await Student.findById(decodedToken.id)
                if (user.isAdmin) {
                    next()
                } else {
                    res.redirect('/')
                }
            }
        })
    } else {
        res.redirect('/home')
    }
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

module.exports = { checkAdmin, approvals }

