const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const strRequired = {
    type: String,
    required: true
}

const adminSchema = new mongoose.Schema({
    email: strRequired,
    password: strRequired,
    closeBatch: [String],
    batches: [String]
});

adminSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

adminSchema.statics.login = async function (email, password) {
    const admin = await this.findOne({ email });
    if (admin) {
        const auth = await bcrypt.compare(password, admin.password);
        if (auth) {
            return admin;
        }
        throw Error('Incorrect Password');
    }
    throw Error('Incorrect Email');
}

const Admin = mongoose.model('admin', adminSchema);

module.exports = Admin;
