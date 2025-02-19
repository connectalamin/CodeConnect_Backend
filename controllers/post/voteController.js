import prisma from "../../DB/db.config.js";

// Upvote/Downvote a Post or Comment
export const createOrUpdateVote = async (req, res) => {
  try {
    const { value, postId, commentId } = req.body;
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    // Ensure only one of postId or commentId is provided
    if (!postId && !commentId) {
      return res.status(400).json({ error: 'Either postId or commentId is required' });
    }

    if (postId && commentId) {
      return res.status(400).json({ error: 'Only one of postId or commentId should be provided' });
    }

    if (postId && isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (commentId && isNaN(commentId)) {
      return res.status(400).json({ error: 'Invalid comment ID' });
    }

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Invalid vote value. Must be 1 or -1.' });
    }

    // Check if the user has already voted on this post or comment
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId,
        OR: [{ postId }, { commentId }]
      }
    });

    if (existingVote) {
      // If the user has already voted, handle the toggle logic
      if (existingVote.value === value) {
        // If the user clicks the same vote button, remove the vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });

        // Update the vote count
        if (postId) {
          await prisma.post.update({
            where: { id: postId },
            data: { voteCount: { decrement: existingVote.value } }
          });
        } else if (commentId) {
          await prisma.comment.update({
            where: { id: commentId },
            data: { voteCount: { decrement: existingVote.value } }
          });
        }

        return res.json({ message: 'Vote removed successfully' });
      } else {
        // If the user clicks the opposite vote button, update the vote
        const updatedVote = await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value }
        });

        // Update the vote count
        if (postId) {
          await prisma.post.update({
            where: { id: postId },
            data: { voteCount: { increment: 2 * value - existingVote.value } }
          });
        } else if (commentId) {
          await prisma.comment.update({
            where: { id: commentId },
            data: { voteCount: { increment: 2 * value - existingVote.value } }
          });
        }

        return res.json({ message: 'Vote updated successfully', vote: updatedVote });
      }
    }

    // Otherwise, create a new vote
    const vote = await prisma.vote.create({
      data: { value, postId: postId || undefined, commentId: commentId || undefined, userId }
    });

    // Update the vote count
    if (postId) {
      await prisma.post.update({
        where: { id: postId },
        data: { voteCount: { increment: value } }
      });
    } else if (commentId) {
      await prisma.comment.update({
        where: { id: commentId },
        data: { voteCount: { increment: value } }
      });
    }

    res.status(201).json({ message: 'Vote created successfully', vote });
  } catch (error) {
    console.error('Error creating or updating vote:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};