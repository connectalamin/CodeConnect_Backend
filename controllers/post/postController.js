import prisma from "../../DB/db.config.js";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: "User ID not found in request." });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        userId,
      },
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error); // Log the error details
    res
      .status(500)
      .json({ error: "Something went wrong", details: error.message });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true,
        comments: {
          include: {
            user: true,
            votes: true,
          },
        },
        votes: true,
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
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Get a Single Post by ID
export const getPostById = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: true,
        comments: {
          include: {
            user: true,
            votes: true
          }
        },
        votes: true
      }
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

    res.json({ post: postWithVotes });
  } catch (error) {
    console.error('Error fetching post by ID:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message }); 
  }
};

// Update Post
export const updatePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { title, content, category } = req.body;
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
      return res.status(403).json({ error: 'Forbidden. You are not authorized to update this post.' });
    }

    // Update the post with the provided fields
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        category,
      },
    });

    res.json({ message: 'Post updated successfully', post: updatedPost });
  } catch (error) {
    console.error('Error updating post:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message }); 
  }
};