const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pattern = /^[A-Za-z0-9 ]+$/;

const CubeSchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [5, 'Name must be at least 5 characters long!'],
        match: [pattern, 'Name must contain only English letters and digits!']
    },
    description: {
        type: String,
        required: true,
        minlength: [20, 'Description must be at least 20 characters long!'],
        match: [pattern, 'Description must contain only English letters and digits!']
    },
    imageUrl: {
        type: String,
        required: true
    },
    difficultyLevel: {
        type: Number,
        required: true
    },
    creatorId: {
        type: 'ObjectId',
        ref: 'User'
    },
    accessories: [{
        type: 'ObjectId',
        ref: 'Accessory'
    }]
});

CubeSchema.path('imageUrl').validate(function(url) {
    return url.startsWith('http://') || url.startsWith('https://');
}, 'Invalid image url!');

module.exports = mongoose.model('Cube', CubeSchema);