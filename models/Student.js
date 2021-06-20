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
    phone: {
        unique: true,
        ...strRequired
    },
    bloodGroup: strRequired,
    healthRecord: strRequired,
    session: strRequired,
    batch: strRequired,
    code: strRequired,
    introducerName: strRequired,
    introducedBy: strRequired,
    introducerRegistration: strRequired,
    designation: strRequired,
    qualification: strRequired,
});

const Student = mongoose.model('student', studentSchema);

module.exports = Student;
