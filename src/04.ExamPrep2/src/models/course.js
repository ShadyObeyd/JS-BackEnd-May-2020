const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        required: true
    },
    creatorId: {
        type: 'ObjectId',
        ref: 'User'
    },
    usersEnrolled: [{
        type: 'ObjectId',
        ref: 'User'
    }]
});

CourseSchema.path('description').validate(function(desc) {
    return desc.length <= 50;
}, 'Description cannot be more than 50 characters long!');

module.exports = mongoose.model('Course', CourseSchema);