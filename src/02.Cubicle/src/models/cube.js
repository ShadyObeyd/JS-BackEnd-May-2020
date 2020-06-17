const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CubeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
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

module.exports = mongoose.model('Cube', CubeSchema);