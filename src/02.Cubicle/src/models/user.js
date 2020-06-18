const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pattern = /^[A-Za-z0-9]+$/;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [5, 'Username must be at least 5 characters long!'],
        match: [pattern, 'Username must contain only English letters and digits!']
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', UserSchema);