import prisma from '../../DB/db.config.js';

// Create a notification
export const createNotification = async (notificationData) => {
  try {
    const notification = await prisma.notification.create({
      data: notificationData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        comment: {
          select: {
            id: true,
            content: true
          }
        },
        relatedUser: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const whereClause = {
      userId: parseInt(userId)
    };

    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      include: {
        post: {
          select: {
            id: true,
            title: true
          }
        },
        comment: {
          select: {
            id: true,
            content: true
          }
        },
        relatedUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take
    });

    const totalCount = await prisma.notification.count({
      where: whereClause
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: parseInt(userId),
        isRead: false
      }
    });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    const notification = await prisma.notification.update({
      where: {
        id: parseInt(notificationId),
        userId: parseInt(userId)
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    await prisma.notification.updateMany({
      where: {
        userId: parseInt(userId),
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    await prisma.notification.delete({
      where: {
        id: parseInt(notificationId),
        userId: parseInt(userId)
      }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    let preferences = await prisma.notificationPreference.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!preferences) {
      // Create default preferences if they don't exist
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: parseInt(userId),
          emailNotifications: true,
          pushNotifications: true,
          inAppNotifications: true,
          notificationTypes: {
            VOTE_POST: true,
            VOTE_COMMENT: true,
            COMMENT_POST: true,
            BEST_ANSWER: true
          }
        }
      });
    }

    res.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.userId;
    const { emailNotifications, pushNotifications, inAppNotifications, notificationTypes } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    const preferences = await prisma.notificationPreference.upsert({
      where: { userId: parseInt(userId) },
      update: {
        emailNotifications,
        pushNotifications,
        inAppNotifications,
        notificationTypes,
        updatedAt: new Date()
      },
      create: {
        userId: parseInt(userId),
        emailNotifications,
        pushNotifications,
        inAppNotifications,
        notificationTypes
      }
    });

    res.json({ message: 'Notification preferences updated successfully', preferences });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
}; 