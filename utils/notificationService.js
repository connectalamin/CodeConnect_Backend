import { createNotification } from '../controllers/post/notificationController.js';
import prisma from '../DB/db.config.js';

// Create notification for vote on post
export const createVotePostNotification = async (voterId, postId, voteValue) => {
  try {
    // Get the post and its author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!post || post.userId === voterId) {
      return; // Don't notify if post doesn't exist or user is voting on their own post
    }

    // Get voter information
    const voter = await prisma.user.findUnique({
      where: { id: voterId },
      select: {
        id: true,
        name: true
      }
    });

    if (!voter) {
      return;
    }

    // Check user's notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: post.userId }
    });

    if (preferences && preferences.notificationTypes && !preferences.notificationTypes.VOTE_POST) {
      return; // User has disabled vote notifications
    }

    const voteType = voteValue === 1 ? 'upvoted' : 'downvoted';
    const title = `${voter.name || 'Someone'} ${voteType} your post`;
    const message = `${voter.name || 'Someone'} ${voteType} your post "${post.title}"`;

    await createNotification({
      userId: post.userId,
      type: 'VOTE_POST',
      title,
      message,
      relatedPostId: postId,
      relatedUserId: voterId
    });

  } catch (error) {
    console.error('Error creating vote post notification:', error);
  }
};

// Create notification for vote on comment
export const createVoteCommentNotification = async (voterId, commentId, voteValue) => {
  try {
    // Get the comment and its author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!comment || comment.userId === voterId) {
      return; // Don't notify if comment doesn't exist or user is voting on their own comment
    }

    // Get voter information
    const voter = await prisma.user.findUnique({
      where: { id: voterId },
      select: {
        id: true,
        name: true
      }
    });

    if (!voter) {
      return;
    }

    // Check user's notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: comment.userId }
    });

    if (preferences && preferences.notificationTypes && !preferences.notificationTypes.VOTE_COMMENT) {
      return; // User has disabled vote notifications
    }

    const voteType = voteValue === 1 ? 'upvoted' : 'downvoted';
    const title = `${voter.name || 'Someone'} ${voteType} your comment`;
    const message = `${voter.name || 'Someone'} ${voteType} your comment on "${comment.post.title}"`;

    await createNotification({
      userId: comment.userId,
      type: 'VOTE_COMMENT',
      title,
      message,
      relatedPostId: comment.postId,
      relatedCommentId: commentId,
      relatedUserId: voterId
    });

  } catch (error) {
    console.error('Error creating vote comment notification:', error);
  }
};

// Create notification for comment on post
export const createCommentPostNotification = async (commenterId, postId, commentId) => {
  try {
    // Get the post and its author
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!post || post.userId === commenterId) {
      return; // Don't notify if post doesn't exist or user is commenting on their own post
    }

    // Get commenter information
    const commenter = await prisma.user.findUnique({
      where: { id: commenterId },
      select: {
        id: true,
        name: true
      }
    });

    if (!commenter) {
      return;
    }

    // Get comment content
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        content: true
      }
    });

    if (!comment) {
      return;
    }

    // Check user's notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: post.userId }
    });

    if (preferences && preferences.notificationTypes && !preferences.notificationTypes.COMMENT_POST) {
      return; // User has disabled comment notifications
    }

    const title = `${commenter.name || 'Someone'} commented on your post`;
    const message = `${commenter.name || 'Someone'} commented on your post "${post.title}": "${comment.content.substring(0, 100)}${comment.content.length > 100 ? '...' : ''}"`;

    await createNotification({
      userId: post.userId,
      type: 'COMMENT_POST',
      title,
      message,
      relatedPostId: postId,
      relatedCommentId: commentId,
      relatedUserId: commenterId
    });

  } catch (error) {
    console.error('Error creating comment post notification:', error);
  }
};

// Create notification for best answer
export const createBestAnswerNotification = async (postId, commentId) => {
  try {
    // Get the comment and its author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    if (!comment) {
      return;
    }

    // Check user's notification preferences
    const preferences = await prisma.notificationPreference.findUnique({
      where: { userId: comment.userId }
    });

    if (preferences && preferences.notificationTypes && !preferences.notificationTypes.BEST_ANSWER) {
      return; // User has disabled best answer notifications
    }

    const title = `Your comment was marked as the best answer!`;
    const message = `Your comment on "${comment.post.title}" was marked as the best answer by ${comment.post.user.name}`;

    await createNotification({
      userId: comment.userId,
      type: 'BEST_ANSWER',
      title,
      message,
      relatedPostId: postId,
      relatedCommentId: commentId,
      relatedUserId: comment.post.userId
    });

  } catch (error) {
    console.error('Error creating best answer notification:', error);
  }
}; 