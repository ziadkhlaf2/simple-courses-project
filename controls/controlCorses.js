const { validationResult } = require("express-validator");
const Courses = require("../models/schema");
const mongoose = require("mongoose");
const HTTPres = require("../utils/HTTPres");
const asyncWrapper = require("../middlewares/asyncwrapper");
const AppError = require("../utils/appError");

const allCorces = async (req, res) => {
  if (req.query.page) {
    const page = Number(req.query.page) || 1;
    const requested = Number(req.query.limit) || 2;
    const limit = Math.min(requested, 50);
    const skip = (page - 1) * limit;
    const courses = await Courses.find().limit(limit).skip(skip); //! حذف الحقول الغير مرغوبة من الرد | Remove unwanted fields from the response
    return res.json({
      status: HTTPres.SUCCESS,
      data: { result: courses.length, courses },
    });
  }
  const courses = await Courses.find();
  res.json({
    status: HTTPres.SUCCESS,
    data: { result: courses.length, courses },
  }); //! يكتب الرد بطريقة Jsend
};

const oneCors = asyncWrapper(async (req, res, next) => {
  if (!req.params.corsID) {
    return res.status(404).json({ message: "Please Enter corsID" });
  }
  if (!mongoose.isValidObjectId(req.params.corsID)) {
    return next(new AppError("Invalid course ID", 400, HTTPres.FAIL));
  }

  let cours = await Courses.findById(req.params.corsID);
  if (!cours) {
    const error = new AppError("Not Found Item !", 404, HTTPres.FAIL);
    return next(error);
  } //! يكتب الرد بطريقة Jsend
  res.json({ status: HTTPres.SUCCESS, data: { cours } }); //! يكتب الرد بطريقة Jsend
});

const addCors = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //* التحقق من صحة البيانات
    return res.status(400).json({ errors: errors.array() });
  }
  let nameItem = req.body.name;
  let name_item = await Courses.findOne({ name: nameItem });
  if (name_item) {
    return res
      .status(400)
      .json({ status: HTTPres.FAIL, data: { Courses: null } });
  } //! يكتب الرد بطريقة Jsend
  let item = await Courses.create(req.body);
  res.status(201).json({ status: HTTPres.SUCCESS, data: { item } }); //! يكتب الرد بطريقة Jsend
};

const patchCors = async (req, res) => {
  if (!req.params.corsID) {
    return res
      .status(400)
      .json({ status: HTTPres.FAIL, data: { Courses: null } });
  }
  if (!mongoose.isValidObjectId(req.params.corsID)) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { id: "Invalid course ID" },
    });
  } //! التحقق من المعرف | Verifying the id

  let corsId = req.params.corsID;

  let item = await Courses.findById(corsId);
  if (!item) {
    return res.status(404).json({ message: "Not Found Item !" });
  }
  if (req.body.name !== undefined) {
    let name_item = await Courses.findOne({
      name: req.body.name,
      _id: { $ne: corsId },
    });
    if (name_item) {
      return res
        .status(400)
        .json({ status: HTTPres.FAIL, data: { Courses: null } });
    }
    item.name = req.body.name;
  }

  if (req.body.price !== undefined) {
    item.price = req.body.price;
  }

  if (req.body.name === undefined && req.body.price === undefined) {
    return res
      .status(400)
      .json({ status: HTTPres.FAIL, data: { Courses: null } });
  }

  let updatedItem = await item.save(); //* حفظ التعديلات
  res.status(200).json({ status: HTTPres.SUCCESS, data: { updatedItem } }); //! يكتب الرد بطريقة Jsend
};

const deleteCors = async (req, res) => {
  if (!req.params.corsID) {
    return res
      .status(400)
      .json({ status: HTTPres.FAIL, data: { Courses: null } });
  } //! يكتب الرد بطريقة Jsend
  if (!mongoose.isValidObjectId(req.params.corsID)) {
    return res.status(400).json({
      status: HTTPres.FAIL,
      data: { id: "Invalid course ID" },
    });
  } //! التحقق من المعرف | Verifying the id
  let deletedItem = await Courses.findByIdAndDelete(req.params.corsID); //* البحث عن المعرف وحذفه | Search for the id and delete it
  if (!deletedItem) {
    return res
      .status(404)
      .json({ status: HTTPres.FAIL, data: { Courses: null } });
  } //! يكتب الرد بطريقة Jsend
  let cors = await Courses.find();
  res.json({ status: HTTPres.SUCCESS, data: deletedItem }); //! يكتب الرد بطريقة Jsend
};

module.exports = {
  allCorces,
  oneCors,
  addCors,
  patchCors,
  deleteCors,
};
