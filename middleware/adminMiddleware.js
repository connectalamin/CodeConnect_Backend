// middleware/adminMiddleware.js
const adminMiddleware = (req, res, next) => {
  // Check if user role is admin (case-insensitive)
  if (!req.userRole || req.userRole.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

export default adminMiddleware;