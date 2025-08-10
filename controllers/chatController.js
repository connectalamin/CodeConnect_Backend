import prisma from '../DB/db.config.js';

// Get public chat rooms with filtering
export const getPublicChatRooms = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const where = {
      isPrivate: false
    };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

  const rooms = await prisma.chatRoom.findMany({
      where,
      include: {
    createdBy: {
          select: {
            id: true,
      name: true,
      image: true
          }
        },
        members: {
          select: {
            userId: true,
            role: true
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    // Check if user is member of each room
    const roomsWithMembershipStatus = rooms.map(room => ({
      ...room,
      isMember: room.members.some(member => member.userId === userId),
      memberCount: room._count.members,
      messageCount: room._count.messages
    }));

    res.json({
      success: true,
      rooms: roomsWithMembershipStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: rooms.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public chat rooms:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch public chat rooms' 
    });
  }
};

// Create a new chat room (public only, admin)
export const createChatRoom = async (req, res) => {
  try {
    const { name, description, category, rules, maxMembers = 100 } = req.body;
    const userId = req.user.id;

    // Enforce admin-only creation (defense-in-depth, route also uses admin middleware)
    if (!req.userRole || req.userRole.toLowerCase() !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required'
      });
    }

    // Check if room name already exists (for public rooms)
    const existingRoom = await prisma.chatRoom.findFirst({
      where: {
        name: name,
        isPrivate: false
      }
    });

    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'A public room with this name already exists'
      });
    }

    // Create the room (always public)
  const room = await prisma.chatRoom.create({
      data: {
        name,
        description: description || '',
        category,
        maxMembers: parseInt(maxMembers),
        isPrivate: false, // Force public rooms only
    createdById: userId
      }
    });

    // Add creator as admin member
  await prisma.chatRoomMember.create({
      data: {
    chatRoomId: room.id,
        userId: userId,
        role: 'ADMIN'
      }
    });

    // Fetch the complete room data
    const completeRoom = await prisma.chatRoom.findUnique({
      where: { id: room.id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Chat room created successfully',
      room: {
        ...completeRoom,
        memberCount: completeRoom._count.members,
        messageCount: completeRoom._count.messages,
        isMember: true
      }
    });
  } catch (error) {
    console.error('Error creating chat room:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create chat room' 
    });
  }
};

// Join a chat room
export const joinChatRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }
    const userId = req.user.id;

    // Check if room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomIdInt },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Only allow joining public rooms
    if (room.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Private rooms are not supported'
      });
    }

    // Check if already a member
    const existingMember = await prisma.chatRoomMember.findUnique({
      where: {
        userId_chatRoomId: {
          userId: userId,
          chatRoomId: roomIdInt
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this room'
      });
    }

    // Check if room is full
    if (room._count.members >= room.maxMembers) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      });
    }

    // Add user to room
  await prisma.chatRoomMember.create({
      data: {
    chatRoomId: roomIdInt,
        userId: userId,
        role: 'MEMBER'
      }
    });

    res.json({
      success: true,
      message: 'Successfully joined the chat room'
    });
  } catch (error) {
    console.error('Error joining chat room:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to join chat room' 
    });
  }
};

// Leave a chat room
export const leaveChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }
    const userId = req.user.id;

    // Check if user is a member
    const membership = await prisma.chatRoomMember.findUnique({
      where: {
        userId_chatRoomId: {
          userId: userId,
          chatRoomId: roomIdInt
        }
      },
      include: {
        chatRoom: {
          select: {
            createdById: true,
            name: true
          }
        }
      }
    });

    if (!membership) {
      return res.status(400).json({
        success: false,
        message: 'You are not a member of this room'
      });
    }

    // Prevent creator from leaving their own room
  if (membership.chatRoom.createdById === userId) {
      return res.status(400).json({
        success: false,
        message: 'Room creators cannot leave their own rooms'
      });
    }

    // Remove user from room
    await prisma.chatRoomMember.delete({
      where: {
        userId_chatRoomId: {
          userId: userId,
          chatRoomId: roomIdInt
        }
      }
    });

    res.json({
      success: true,
      message: 'Successfully left the chat room'
    });
  } catch (error) {
    console.error('Error leaving chat room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave chat room'
    });
  }
};

// Get chat room details
export const getChatRoomDetails = async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room id'
      });
    }
    const userId = req.user.id;

    const room = await prisma.chatRoom.findUnique({
      where: { id: roomIdInt },
      include: {
    createdBy: {
          select: {
            id: true,
      name: true,
      image: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
        name: true,
        image: true
              }
            }
          },
          orderBy: {
            joinedAt: 'asc'
          }
        },
        _count: {
          select: {
            members: true,
            messages: true
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Check if user is a member (required for private rooms)
  const isMember = room.members.some(member => member.userId === userId);
    
    if (room.isPrivate && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      room: {
        ...room,
        memberCount: room._count.members,
        messageCount: room._count.messages,
        isMember
      }
    });
  } catch (error) {
    console.error('Error fetching chat room details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat room details'
    });
  }
};

// Get chat room messages
export const getChatRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      console.warn('[CHAT][MSG] Invalid room id param', roomId);
      return res.status(400).json({
        success: false,
        message: 'Invalid room id'
      });
    }

    console.log('[CHAT][MSG][REQ]', { roomId, roomIdInt, userId, page, limit });

    // Check if user is a member of the room
    const membership = await prisma.chatRoomMember.findUnique({
      where: {
        userId_chatRoomId: {
          userId: userId,
          chatRoomId: roomIdInt
        }
      }
    });

    if (!membership) {
      console.warn('[CHAT][MSG][MEMBERSHIP_MISSING]', { userId, roomId: roomIdInt });
      return res.status(403).json({
        success: false,
        message: 'You must be a member to view messages'
      });
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    console.log('[CHAT][MSG][QUERY_PARAMS]', { take, skip });

    const messages = await prisma.chatMessage.findMany({
      where: {
        chatRoomId: roomIdInt
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take,
      skip
    });

    console.log('[CHAT][MSG][RESULT]', { fetched: messages.length });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: take,
        hasMore: messages.length === take
      }
    });
  } catch (error) {
    console.error('[CHAT][MSG][ERROR]', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Get chat statistics
export const getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const [publicRoomsCount, userMembershipsCount, totalMessages] = await Promise.all([
      prisma.chatRoom.count({
        where: { isPrivate: false }
      }),
      prisma.chatRoomMember.count({
        where: { userId }
      }),
      prisma.chatMessage.count({
        where: {
          chatRoom: {
            members: {
              some: { userId }
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      statistics: {
        publicRooms: publicRoomsCount,
        totalRooms: userMembershipsCount,
        totalMessages
      }
    });
  } catch (error) {
    console.error('Error fetching chat statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat statistics'
    });
  }
};

// Delete a chat room (admin only)
export const deleteChatRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const roomIdInt = parseInt(roomId);
    if (isNaN(roomIdInt)) {
      return res.status(400).json({ success: false, message: 'Invalid room id' });
    }

    if (!req.userRole || req.userRole.toLowerCase() !== 'admin') {
      console.warn('[CHAT][DELETE][DENY]', { userId: req.user?.id, role: req.userRole, roomId: roomIdInt });
      return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }

    const room = await prisma.chatRoom.findUnique({ where: { id: roomIdInt } });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Chat room not found' });
    }

    await prisma.chatRoom.delete({ where: { id: roomIdInt } });
    console.log('[CHAT][DELETE][OK]', { roomId: roomIdInt, by: req.user?.id });
    return res.json({ success: true, message: 'Chat room deleted' });
  } catch (error) {
    console.error('[CHAT][DELETE][ERROR]', { message: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to delete chat room' });
  }
};
