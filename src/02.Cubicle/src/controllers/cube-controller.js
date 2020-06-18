const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const jwt = require('jsonwebtoken');
const Cube = require('../models/cube');
const pattern = /^[A-Za-z0-9 ]+$/;

const getAllCubes = async () => {
    let cubes = await Cube.find().lean();

    return cubes;
};

const saveCube = async (req, res) => {
    let { name,
        description,
        imageUrl,
        difficultyLevel } = req.body;

    if (!name || name.length < 5) {
        res.redirect('/create?error=Name must be at least 5 characters long!');
        return;
    }

    if (!name.match(pattern)) {
        res.redirect('/create?error=Name must contain only English letters and digits!');
        return;
    }

    if (!description || description.length < 20) {
        res.redirect('/create?error=Description must be at least 20 characters long!');
        return;
    }

    if (!description.match(pattern)) {
        res.redirect('/create?error=Description must contain only English letters and digits!');
        return;
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        res.redirect('/create?error=Invalid image url!');
        return;
    }

    let token = req.cookies['authToken'];
    let decodedToken = jwt.verify(token, config.privateKey);

    let cube = new Cube({ name, description, imageUrl, difficultyLevel, creatorId: decodedToken.userId });

    await cube.save();

    res.redirect('/');
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