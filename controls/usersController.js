const Users = require("../models/users");
const HTTPres = require("../utils/HTTPres");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const generateJWT = require("../utils/generateJWT");
const appError = require("../utils/appError");
const { findByIdAndDelete } = require("../models/schema");



const getAllUsers = async (req, res) => {
  if (req.query.page) {
    const requestedPage = Number(req.query.page);
    const requestedLimit = Number(req.query.limit);
    if (requestedPage < 0 || requestedLimit < 0) {
      return res.status(400).json({
        status: HTTPres.FAIL,
        data: { message: "Page and limit must be positive numbers" },
      });
    }

    const page = requestedPage || 1;
    const requested = requestedLimit || 2;
    const limit = Math.min(requested, 50);
    const skip = (page - 1) * limit;
    const users = await Users.find().select("-password").limit(limit).skip(skip); //> Pagination logic
    return res.json({
      status: HTTPres.SUCCESS,
      data: { result: users.length, users },
    });
  }
  const users = await Users.find().select("-password");
  res.json({
    status: HTTPres.SUCCESS,
    data: { result: users.length, users },
  }); //! يكتب الرد بطريقة Jsend
};



const registerUser = async (req, res) => {
  const { name, email, password, role, avatar } = req.body || {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string" ||
    !name.trim() ||
    !email.trim() ||
    !password ||
    !role.trim()
  ) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { message: "Name, email, password, and role are required" },
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!validator.isEmail(cleanEmail)) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { message: "Please enter a valid email" },
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { message: "Password must be at least 8 characters" },
    });
  }

  const existingUser = await Users.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(409).json({
      status: HTTPres.FAIL,
      data: { message: "Email is already registered" },
    });
  }


  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await Users.create({
    name: name.trim(),
    email: cleanEmail,
    password: hashedPassword,
    role: role.trim().toUpperCase(),
    avatar: req.file ? req.file.path : undefined,
  });


  //^ Generate JWT token
  const token = await generateJWT({ id: user._id, email: user.email, role: user.role });
  user.token = token;
  await user.save();


  

  return res.status(201).json({
    status: HTTPres.SUCCESS,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    },
  });
};



const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { message: "Email and password are required" },
    });
  }

  const user = await Users.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res.status(401).json({
      status: HTTPres.FAIL,
      data: { message: "Email or password is incorrect" },
    });
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return res.status(401).json({
      status: HTTPres.FAIL,
      data: { message: "Email or password is incorrect" },
    });
  }

  //^ Generate JWT token
  const token = await generateJWT({ id: user._id, email: user.email, role: user.role });

  return res.json({
    status: HTTPres.SUCCESS,
    data: {
      MSG: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};



const patchUser = async (req, res) => {
  const { name, email, password } = req.body || {};
  const updates = {};

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { message: "Invalid user ID" },
    });
  }

  if (name === undefined && email === undefined && password === undefined) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { message: "At least one field is required" },
    });
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        status: HTTPres.FAIL,
        data: { message: "Name must be a non-empty string" },
      });
    }
    updates.name = name.trim();
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !validator.isEmail(email.trim())) {
      return res.status(400).json({
        status: HTTPres.FAIL,
        data: { message: "Please enter a valid email" },
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await Users.findOne({
      email: cleanEmail,
      _id: { $ne: req.params.id },
    });
    if (existingUser) {
      return res.status(409).json({
        status: HTTPres.FAIL,
        data: { message: "Email is already registered" },
      });
    }
    updates.email = cleanEmail;
  }

  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        status: HTTPres.FAIL,
        data: { message: "Password must be at least 8 characters" },
      });
    }
    updates.password = await bcrypt.hash(password, 10);
  }

  const user = await Users.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );
  if (!user) {
    return res.status(404).json({
      status: HTTPres.FAIL,
      data: { message: "User not found" },
    });
  }

  const updatedFields = {};
  if (name !== undefined) updatedFields.name = user.name;
  if (email !== undefined) updatedFields.email = user.email;
  if (password !== undefined) updatedFields.passwordUpdated = true;

  return res.json({
    status: HTTPres.SUCCESS,
    data: {
      MSG: "User updated successfully",
      Role: user.role,
      updated: updatedFields,
    },
  });
};



const deleteUser = async (req, res, next) => {
  
  const idUser = req.params.id
  if (!idUser){
    return next(new appError("User ID is required", 400, HTTPres.FAIL));
  }
  if (!mongoose.isValidObjectId(idUser)){
    return next(new appError("Invalid user ID", 400, HTTPres.ERROR));
  }

  const user = await Users.findByIdAndDelete(idUser)

  if (!user){
    return next(new appError("User not found", 404, HTTPres.FAIL));
  }
  return res.json({
    status: HTTPres.SUCCESS,
    data: {
      MSG: `${user.email} deleted successfully`,
    },
  });

}


module.exports = {
    getAllUsers,
    registerUser,
    loginUser,
    patchUser,
    deleteUser
}