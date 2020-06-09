const Accessory = require('../models/accessory');

const getAllAccessories = async () => {
    let accessories = await Accessory.find().lean();

    return accessories;
}

const saveAccessory = async (name, description, imageUrl) => {
    let accessory = new Accessory({ name, description, imageUrl });

    await accessory.save((err) => {
        if (err) {
            console.log(err);
            throw err;
        }
    })
};

module.exports = {
    saveAccessory,
    getAllAccessories
}