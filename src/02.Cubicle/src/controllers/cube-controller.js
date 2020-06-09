const Cube = require('../models/cube');

const getAllCubes = async () => {
    let cubes = await Cube.find().lean();

    return cubes;
};

const saveCube = async (name, description, imageUrl, difficultyLevel) => {
    let cube = new Cube({name, description, imageUrl, difficultyLevel});

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

const search = (string, from, to) => {
    
}

module.exports = {
    getAllCubes,
    saveCube,
    getCubeById,
    search,
    attachAccessoryToCube
};