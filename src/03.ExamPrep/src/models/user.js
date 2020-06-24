const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    trippsHistory: [{
        type: 'ObjectId',
        ref: 'Tripp'
    }]
});

module.exports = mongoose.model('User', UserSchema);