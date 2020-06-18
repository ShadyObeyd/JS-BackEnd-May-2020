const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const pattern = /^[A-Za-z0-9 ]+$/;

const AccessorySchema = new Schema({
    name: {
        type: String,
        required: true,
        minlength: [5, 'Name must be at least 5 characters long!'],
        match: [pattern, 'Name must contain only English letters and digits!']
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
        minlength: [20, 'Description must be at least 20 characters long!'],
        match: [pattern, 'Description must contain only English letters and digits!']
    },
    cubes: [{
        type: 'ObjectId',
        ref: 'Cube'
    }]
});

AccessorySchema.path('imageUrl').validate(function(url) {
    return url.startsWith('http://') || url.startsWith('https://');
}, 'Invalid image url!');

module.exports = mongoose.model('Accessory', AccessorySchema);