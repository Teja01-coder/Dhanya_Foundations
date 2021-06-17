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
                    res.redirect('/home')
                }
            }
        })
    } else {
        res.redirect('/home')
    }
}

const approvals = async (_, res, next) => {
    const newUsers = await Student.find({ isVerified: false })

    if (newUsers) {
        res.locals.users = newUsers
        next()
    } else {
        res.locals.users = null
        next()
    }
}

module.exports = { requireAuth, checkUser, checkAdmin, approvals }

