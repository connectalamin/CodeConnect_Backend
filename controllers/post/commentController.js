import prisma from "../../DB/db.config.js";
import { calculateRanking } from '../../utils/rankingUtils.js';

// Create a comment
export const createComment = async (req, res) => {
    try {
      const userId = req.userId; 
      const { content } = req.body;
      const postId = parseInt(req.params.id);
  
      if (!userId) {
        return res.status(400).json({ error: "User ID not found in request." });
      }
  
      // Create the comment with the correct relations
      const comment = await prisma.comment.create({
        data: {
          content,
          userId: userId,
          postId: postId,
        },
      });
  
      res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Something went wrong", details: error.message });
    }
  };

// Get comment by post ID
export const getCommentsForPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);

    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            karmaPoints: true // Include karmaPoints
          }
        },
        votes: true
      }
    });

    const commentsWithVotes = comments.map(comment => {
      const upvotes = comment.votes.filter(vote => vote.value === 1).length;
      const downvotes = comment.votes.filter(vote => vote.value === -1).length;
      const totalVotes = upvotes - downvotes;
      const ranking = calculateRanking(comment.user.karmaPoints); // Use karmaPoints

      return {
        ...comment,
        upvotes,
        downvotes,
        totalVotes,
        user: {
          ...comment.user,
          ranking // Attach ranking to user object
        }
      };
    });

    res.json({ comments: commentsWithVotes });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Update Comment 
export const updateComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const { content } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Fetch the comment to ensure it exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You are not authorized to update this comment.' });
    }

    // Update the comment with the provided fields
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content,
      },
    });

    res.json({ message: 'Comment updated successfully', comment: updatedComment });
  } catch (error) {
    console.error('Error updating comment:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

//Delete Comment
export const deleteComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const userId = req.userId; // From authMiddleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    // Fetch the comment to ensure it exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You are not authorized to delete this comment.' });
    }

    const deletedComment = await prisma.comment.delete({
      where: { id: commentId },
    });

    res.json({ message: 'Comment deleted successfully', comment: deletedComment });
  } catch (error) {
    console.error('Error deleting comment:', error); 

    // Handle specific Prisma errors if needed
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Best Answer

export const checkBestAnswer = async (req,res)=>{
  try {
    const commentId = parseInt(req.params.commentId);
    const userId=req.userId;

       
    if (isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }
  
    // Fetch the comment to ensure it exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include:{
        post:true,
      }
    });
    if (comment.post.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden. You are not authorized to mark this comment as the best answer.' });
    }
    // Toggle the isBestAnswer field
    const isBestAnswer = !comment.isBestAnswer;

    // Update the post to set or unset the best answer
    const updatedPost = await prisma.post.update({
      where: { id: comment.postId },
      data: { bestAnswerId: isBestAnswer ? commentId : null },
    });

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { isBestAnswer: isBestAnswer },
    });
    
    await updateKarmaPoints(comment.userId);

    const message = isBestAnswer
    ? 'Best answer marked successfully'
    : 'Best answer removed successfully';

  res.json({ message, post: updatedPost, comment: updatedComment });

  } catch (error) {
    console.error("Error marking best answer",error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
} 

// Helper function to recalculate and update karma points
const updateKarmaPoints = async (userId) => {
  // Fetch the user to recalculate karma points
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
      comments: true,
      votes: true
    }
  });

  // Calculate karma points
  const upvotesOnPosts = user.posts.reduce((sum, post) => sum + post.voteCount, 0);
  const upvotesOnComments = user.comments.reduce((sum, comment) => sum + comment.voteCount, 0);
  const downvotesOnPosts = user.votes.filter(vote => vote.postId && vote.value === -1).length;
  const downvotesOnComments = user.votes.filter(vote => vote.commentId && vote.value === -1).length;
  const bestAnswers = user.comments.filter(comment => comment.isBestAnswer).length;

  const karmaPoints = upvotesOnPosts + upvotesOnComments - downvotesOnPosts - downvotesOnComments + (bestAnswers * 10);

  // Update the user's karma points in the database
  await prisma.user.update({
    where: { id: userId },
    data: { karmaPoints }
  });
};