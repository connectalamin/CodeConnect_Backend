// Saved Post Controller
const savedPostController = {
  // Save a post
  savePost: async (req, res) => {
    try {
      const { prisma } = req;
      const { postId } = req.params;
      const userId = req.userId; // Changed from req.user.id

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: parseInt(postId) }
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if already saved
      const existingSave = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: parseInt(postId)
          }
        }
      });

      if (existingSave) {
        return res.status(400).json({ error: 'Post already saved' });
      }

      // Save the post
      const savedPost = await prisma.savedPost.create({
        data: {
          userId: userId,
          postId: parseInt(postId)
        },
        include: {
          post: {
            include: {
              user: true,
              category: true,
              _count: {
                select: {
                  comments: true,
                  votes: true
                }
              }
            }
          }
        }
      });

      res.status(201).json({
        message: 'Post saved successfully',
        savedPost
      });
    } catch (error) {
      console.error('Error saving post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Unsave a post
  unsavePost: async (req, res) => {
    try {
      const { prisma } = req;
      const { postId } = req.params;
      const userId = req.userId; // Changed from req.user.id

      // Check if saved post exists
      const savedPost = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: parseInt(postId)
          }
        }
      });

      if (!savedPost) {
        return res.status(404).json({ error: 'Saved post not found' });
      }

      // Delete the saved post
      await prisma.savedPost.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId: parseInt(postId)
          }
        }
      });

      res.json({ message: 'Post unsaved successfully' });
    } catch (error) {
      console.error('Error unsaving post:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get user's saved posts
  getSavedPosts: async (req, res) => {
    try {
      const { prisma } = req;
      const userId = req.userId; // Changed from req.user.id
      const { page = 1, limit = 10 } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const savedPosts = await prisma.savedPost.findMany({
        where: { userId: userId },
        include: {
          post: {
            include: {
              user: true,
              category: true,
              comments: {
                include: {
                  user: true
                }
              },
              votes: true,
              _count: {
                select: {
                  comments: true,
                  votes: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: skip,
        take: parseInt(limit)
      });

      const total = await prisma.savedPost.count({
        where: { userId: userId }
      });

      res.json({
        savedPosts: savedPosts.map(sp => sp.post),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Check if a post is saved by current user
  checkIfSaved: async (req, res) => {
    try {
      const { prisma } = req;
      const { postId } = req.params;
      const userId = req.userId; // Changed from req.user.id

      const savedPost = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: parseInt(postId)
          }
        }
      });

      res.json({
        isSaved: !!savedPost
      });
    } catch (error) {
      console.error('Error checking if post is saved:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

export default savedPostController; 