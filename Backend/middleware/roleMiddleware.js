/**
 * restrictTo(...roles) — only allows users whose role is in the list.
 * Must be used AFTER the protect middleware.
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role))
    return res.status(403).json({ message: `Access denied. Required role(s): ${roles.join(', ')}` });
  next();
};

module.exports = { restrictTo };
