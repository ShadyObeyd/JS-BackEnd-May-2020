const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaySchema = new Schema({
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
        type: String,
        required: true
    },
    creatorId: {
        type: 'ObjectId',
        required: true,
        ref: 'User'
    },
    usersLiked: [{
        type: 'ObjectId',
        ref: 'User'
    }]
});

PlaySchema.path('description').validate(function(desc) {
    return desc.length <= 50;
}, 'Description cannot be more than 50 characters long!');

module.exports = mongoose.model('Play', PlaySchema);