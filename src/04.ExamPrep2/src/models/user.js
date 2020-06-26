const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    enrolledCourses: [{
        type: 'ObjectId',
        ref: 'Course'
    }]
});

module.exports = mongoose.model('User', UserSchema);