const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole) {
            return res.status(403).json({ message: 'Access denied. No role found.' });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.userRole}' is not authorized.`
            });
        }

        next();
    };
};

module.exports = authorizeRoles;
