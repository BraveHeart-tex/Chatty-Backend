const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/generateToken");
const UserService = require("../services/userService");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please fill all the fields");
  }

  try {
    const user = await UserService.registerUser(name, email, password, picture);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserService.authUser(email, password);

  res.json(user);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const users = await UserService.getAllUsers(search);

  res.json(users);
});

module.exports = {
  registerUser,
  authUser,
  getAllUsers,
};
