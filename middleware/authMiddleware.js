
import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract token from "Bearer <token>"
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role; // Attach role to request
    
    // Fetch user details from database for controllers that need it
    const user = await req.prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, role: true, image: true }
    });
    req.user = user;
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

export default authMiddleware;