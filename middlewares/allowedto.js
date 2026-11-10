const HTTPres = require("../utils/HTTPres");

module.exports = (...allowedRoles) => {
    
    return (req, res, next) => {
        if (!allowedRoles.includes(req.currentUser.role)) {
            return res.status(403).json({
                status: HTTPres.FAIL,
                data: { message: "You are not allowed to perform this action" },
            });
        }
        next();
    };
};
