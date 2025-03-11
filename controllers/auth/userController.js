import prisma from '../../DB/db.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

//  Password Strength Validation Function
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  return regex.test(password);
};

//  Signup Controller
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate Password Strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters long, include an uppercase letter, lowercase letter, a number, and a special character.',
      });
    }

    //  Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    //  Hash the password (Using 12 rounds for extra security)
    const hashedPassword = await bcrypt.hash(password, 12);

    //  Create the user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

//  Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role }, // Include role in the token
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};

//  Logout Controller
export const logout = async (req, res) => {
  try {
    
    res.json({ 
      message: 'Logged out successfully',
   
      expiresIn: new Date(0)
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Something went wrong during logout' });
  }
};


// Admin Role
// Delete User

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userIdToDelete = parseInt(id);

    // Prevent admin from deleting themselves
    if (req.userId === userIdToDelete) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userIdToDelete } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id: userIdToDelete } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
};