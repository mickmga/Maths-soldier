const bcrypt = require("bcrypt");

const {User} = require('./db');

const register = async (username, password) => {

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);

    const hashedPassword = bcrypt.hash(password, salt);

    const newUser = new User({
        name: username,
        password: hashedPassword,
        palaces: []
    });

    await newUser.save();

    return newUser;
}