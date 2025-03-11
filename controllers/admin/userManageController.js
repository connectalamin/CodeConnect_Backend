import prisma from '../../DB/db.config.js';

// Delete User
export const deleteUser = async (req, res) => {
    try {
      const { id } = req.params;
      const userIdToDelete = parseInt(id, 10);
      const requestingUserId = parseInt(req.userId, 10);
  
      console.log('[DEBUG] Attempting to delete user ID:', userIdToDelete);
      console.log('[DEBUG] Request comes from user ID:', requestingUserId);
  
      const userToDelete = await prisma.user.findUnique({ 
        where: { id: userIdToDelete },
        include: {
          posts: true,
          comments: true,
          votes: true
        }
      });
  
      console.log('[DEBUG] User to delete:', JSON.stringify(userToDelete, null, 2));
  
      if (!userToDelete) {
        console.log('[DEBUG] User not found');
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Check if user is ADMIN (using exact enum value)
      if (userToDelete.role === 'ADMIN') {
        console.log('[DEBUG] Attempted to delete ADMIN account');
        return res.status(403).json({ error: 'Cannot delete admin account' });
      }
  
      // Prevent self-deletion
      if (userIdToDelete === requestingUserId) {
        console.log('[DEBUG] User attempted self-deletion');
        return res.status(403).json({ error: 'Cannot delete your own account' });
      }
  
      console.log('[DEBUG] Starting transaction to delete related records...');
      
      // Use transaction to delete related records
      await prisma.$transaction([
        // Delete votes
        prisma.vote.deleteMany({
          where: { userId: userIdToDelete }
        }),
        
        // Delete comments
        prisma.comment.deleteMany({
          where: { userId: userIdToDelete }
        }),
        
        // Update posts that have this user's comments as best answer
        prisma.post.updateMany({
          where: { bestAnswerId: { in: userToDelete.comments.map(c => c.id) } },
          data: { bestAnswerId: null }
        }),
        
        // Delete posts
        prisma.post.deleteMany({
          where: { userId: userIdToDelete }
        }),
        
        // Finally delete the user
        prisma.user.delete({
          where: { id: userIdToDelete }
        })
      ]);
  
      console.log('[DEBUG] User and related records deleted successfully');
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('[ERROR] Delete operation failed:', error);
      res.status(500).json({ 
        error: 'Something went wrong',
        details: error.message // Only include in development
      });
    }
  };

  export const getUsers = async (req, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
      res.json({ users }); // Return in the expected format { users: [...] }
    } catch (error) {
      console.error('[ERROR] Fetch users failed:', error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };