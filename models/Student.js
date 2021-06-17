const mongoose = require('mongoose')

const strRequired = {
    type: String,
    required: true
}

const studentSchema = new mongoose.Schema({
    name: strRequired,
    address: strRequired,
    city: strRequired,
    age: strRequired,
    phone: strRequired,
    bloodGroup: strRequired,
    healthrecord: strRequired,
    session: strRequired,
    code: strRequired,
    introducerName: strRequired,
    introducedBy: strRequired,
    introducerRegistration: strRequired,
    designation: strRequired,
    qualification: strRequired,
    isVerified: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

const Student = mongoose.model('student', studentSchema);

module.exports = Student;
