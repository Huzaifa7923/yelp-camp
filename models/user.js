const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMongoose = require('passport-local-mongoose')
mongoose.set('strictQuery', true);
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

//automatically add on username,pw fields and some additional methods
UserSchema.plugin(passportLocalMongoose)
module.exports = mongoose.model('User', UserSchema
)
