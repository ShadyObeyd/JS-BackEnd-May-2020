const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const jwt = require('jsonwebtoken');
const Cube = require('../models/cube');

const getAllCubes = async () => {
    let cubes = await Cube.find().lean();

    return cubes;
};

const saveCube = async (name, description, imageUrl, difficultyLevel, creatorId) => {
    let cube = new Cube({ name, description, imageUrl, difficultyLevel, creatorId });

    await cube.save((err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    });
}

const getCubeById = async (id) => {
    let cube = await Cube.findById(id).populate('accessories').lean();

    return cube;
}

const attachAccessoryToCube = async (cubeId, accessoryId) => {
    await Cube.findByIdAndUpdate(cubeId, {
        $addToSet: {
            accessories: [accessoryId]
        }
    });
}

const editCube = async (cubeId, name, description, imageUrl, difficultyLevel) => {
    let updateCubeObj = {
        name,
        description,
        imageUrl,
        difficultyLevel
    };

    await Cube.findByIdAndUpdate(cubeId, updateCubeObj);
}

const deleteCube = async (cubeId) => {
    await Cube.findByIdAndDelete(cubeId);
}

const isOwnCube = (req, cube) => {
    let token = req.cookies['authToken'];
    if (token) {
        try {
            let decodedToken = jwt.verify(token, config.privateKey);
            return cube.creatorId == decodedToken.userId;
        } catch (e) {
            return false;
        }
    }
    
    return false;
}

const search = (string, from, to) => {

}

module.exports = {
    getAllCubes,
    saveCube,
    getCubeById,
    search,
    attachAccessoryToCube,
    editCube,
    deleteCube,
    isOwnCube
};