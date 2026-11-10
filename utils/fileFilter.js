const appError = require("../utils/appError");

module.exports = (req, file, cb, next) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            return cb(new appError("Invalid file type. Only JPEG, PNG, and GIF are allowed.", 400, "fail"), false);
        }
    }
