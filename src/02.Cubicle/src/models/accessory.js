const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccessorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    cubes: [{
        type: 'ObjectId',
        ref: 'Cube'
    }]
});

module.exports = mongoose.model('Accessory', AccessorySchema);