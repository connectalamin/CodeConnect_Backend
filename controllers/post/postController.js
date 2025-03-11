import prisma from "../../DB/db.config.js";
import { calculateRanking } from "../../utils/rankingUtils.js";

// Create Post
export const createPost = async (req, res) => {
  try {
    const { title, content, categoryId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    if (!categoryId) {
      return res.status(400).json({ error: 'Category ID is required' });
    }

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        categoryId: parseInt(categoryId),
        userId,
      },
    });

    res.status(201).json({ message: 'Post created successfully', post });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: {
          select: {
            name: true,
            image: true,
            karmaPoints: true, 
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            votes: true, // Include votes for each comment
          },
        },
        votes: true, // Include votes for each post
      },
    });

    // Aggregate upvotes and downvotes for each post
    const postsWithVotes = posts.map((post) => {
      const upvotes = post.votes.filter((vote) => vote.value === 1).length;
      const downvotes = post.votes.filter((vote) => vote.value === -1).length;
      const totalVotes = upvotes - downvotes;

      return {
        ...post,
        upvotes,
        downvotes,
        totalVotes,
      };
    });

    res.status(200).json({ posts: postsWithVotes });
  } catch (error) {
    console.error('Error fetching posts:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Get a Single Post by ID
export const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            karmaPoints: true, // Include karmaPoints
          },
        },
        comments: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            votes: true, // Include votes for each comment
          },
        },
        votes: true, // Include votes for the post
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Aggregate upvotes and downvotes for the post
    const upvotes = post.votes.filter(vote => vote.value === 1).length;
    const downvotes = post.votes.filter(vote => vote.value === -1).length;
    const totalVotes = upvotes - downvotes;

    const postWithVotes = {
      ...post,
      upvotes,
      downvotes,
      totalVotes
    };

    // Determine ranking based on karma points
    const ranking = calculateRanking(post.user.karmaPoints);

    const postWithRanking = {
      ...postWithVotes,
      user: {
        ...postWithVotes.user,
        ranking
      }
    };

    res.json({ post: postWithRanking });
  } catch (error) {
    console.error('Error fetching post by ID:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Update Post
export const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content, categoryId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You are not authorized to update this post.' });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!category) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        categoryId: categoryId ? parseInt(categoryId) : post.categoryId,
      },
    });

    res.json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Delete Post
export const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    // Fetch the post to ensure it exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You are not authorized to delete this post.' });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};