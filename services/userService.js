const { generateToken } = require("../config/generateToken");
const User = require("../models/userModel");
const registerUser = async (name, email, password, picture) => {
  if (!name || !email || !password) {
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    picture,
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    token: generateToken(user._id),
  };
};

const authUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    };
  } else {
    throw new Error("Invalid email or password");
  }
};

const getAllUsers = async (search) => {
  try {
    const keyword = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({ ...keyword }).select("-password");

    return users;
  } catch (error) {
    throw new Error("Failed to fetch users");
  }
};

module.exports = {
  registerUser,
  authUser,
  getAllUsers,
};
