import jwt from 'jsonwebtoken';

export const setupChatSocket = (io, prisma) => {
  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true, image: true }
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.name} connected with socket ID: ${socket.id}`);

    // Join user to their rooms
    socket.on('join-rooms', async () => {
      try {
        const userRooms = await prisma.chatRoomMember.findMany({
          where: { userId: socket.userId },
          include: { chatRoom: true }
        });

        for (const { chatRoom } of userRooms) {
          socket.join(`room-${chatRoom.id}`);
          
          // Update user online status
          await prisma.chatRoomMember.update({
            where: {
              userId_chatRoomId: {
                userId: socket.userId,
                chatRoomId: chatRoom.id
              }
            },
            data: {
              isOnline: true,
              lastSeen: new Date()
            }
          });
        }

        // Emit user online status to rooms
        userRooms.forEach(({ chatRoom }) => {
          socket.to(`room-${chatRoom.id}`).emit('user-online', {
            userId: socket.userId,
            userName: socket.user.name
          });
        });

        socket.emit('rooms-joined', { 
          message: 'Successfully joined your rooms',
          roomCount: userRooms.length 
        });
      } catch (error) {
        console.error('Error joining rooms:', error);
        socket.emit('error', { message: 'Failed to join rooms' });
      }
    });

    // Join a specific room
    socket.on('join-room', async (data) => {
      try {
        const { roomId } = data;
        
        // Verify user is a member of the room; if not and room is public, auto-add
        let membership = await prisma.chatRoomMember.findUnique({
          where: {
            userId_chatRoomId: {
              userId: socket.userId,
              chatRoomId: roomId
            }
          },
          include: { chatRoom: true }
        });

        if (!membership) {
          // Fetch room to check if it's public
          const room = await prisma.chatRoom.findUnique({ where: { id: roomId } });
          if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
          }
          if (room.isPrivate) {
            socket.emit('error', { message: 'You are not a member of this room' });
            return;
          }
          // Auto-create membership for public room
          try {
            membership = await prisma.chatRoomMember.create({
              data: {
                userId: socket.userId,
                chatRoomId: roomId,
                role: 'MEMBER',
                isOnline: true,
                lastSeen: new Date()
              },
              include: { chatRoom: true }
            });
            console.log('[SOCKET][JOIN][AUTO_MEMBER]', { userId: socket.userId, roomId });
          } catch (createErr) {
            // Race condition safe-guard: someone else already created membership
            if (createErr.code === 'P2002') { // Prisma unique constraint
              membership = await prisma.chatRoomMember.findUnique({
                where: {
                  userId_chatRoomId: { userId: socket.userId, chatRoomId: roomId }
                },
                include: { chatRoom: true }
              });
            } else {
              console.error('[SOCKET][JOIN][CREATE_MEMBER_ERROR]', createErr);
              socket.emit('error', { message: 'Failed to join room' });
              return;
            }
          }
        }

        socket.join(`room-${roomId}`);
        
        // Update online status
        await prisma.chatRoomMember.update({
          where: {
            userId_chatRoomId: {
              userId: socket.userId,
              chatRoomId: roomId
            }
          },
          data: {
            isOnline: true,
            lastSeen: new Date()
          }
        });

        // Notify others in the room
        socket.to(`room-${roomId}`).emit('user-joined', {
          userId: socket.userId,
          userName: socket.user.name,
          roomId
        });

        socket.emit('room-joined', { 
          roomId,
          roomName: membership.chatRoom.name,
          message: 'Successfully joined room' 
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a specific room
    socket.on('leave-room', async (data) => {
      try {
        const { roomId } = data;
        
        socket.leave(`room-${roomId}`);
        
        // Update online status
        await prisma.chatRoomMember.update({
          where: {
            userId_chatRoomId: {
              userId: socket.userId,
              chatRoomId: roomId
            }
          },
          data: {
            isOnline: false,
            lastSeen: new Date()
          }
        });

        // Notify others in the room
        socket.to(`room-${roomId}`).emit('user-left', {
          userId: socket.userId,
          userName: socket.user.name,
          roomId
        });

        socket.emit('room-left', { roomId, message: 'Left room successfully' });
      } catch (error) {
        console.error('Error leaving room:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Send message to room
    socket.on('send-message', async (data) => {
      try {
        const { roomId, content } = data;

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        // Verify user is a member of the room
        const membership = await prisma.chatRoomMember.findUnique({
          where: {
            userId_chatRoomId: {
              userId: socket.userId,
              chatRoomId: roomId
            }
          }
        });

        if (!membership) {
          socket.emit('error', { message: 'You are not a member of this room' });
          return;
        }

        // Create the message
        const message = await prisma.chatMessage.create({
          data: {
            content: content.trim(),
            userId: socket.userId,
            chatRoomId: roomId
          },
          include: {
            user: {
              select: { id: true, name: true, image: true }
            }
          }
        });

        // Update room's last activity
        await prisma.chatRoom.update({
          where: { id: roomId },
          data: { updatedAt: new Date() }
        });

        // Emit message to all users in the room
        const messageData = {
          id: message.id,
          content: message.content,
          user: message.user,
          createdAt: message.createdAt,
          roomId: roomId
        };

        io.to(`room-${roomId}`).emit('new-message', messageData);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // User typing indicator
    socket.on('typing-start', (data) => {
      const { roomId } = data;
      socket.to(`room-${roomId}`).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId
      });
    });

    socket.on('typing-stop', (data) => {
      const { roomId } = data;
      socket.to(`room-${roomId}`).emit('user-stopped-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        roomId
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.name} disconnected`);
      
      try {
        // Update user's online status in all rooms
        await prisma.chatRoomMember.updateMany({
          where: { userId: socket.userId },
          data: {
            isOnline: false,
            lastSeen: new Date()
          }
        });

        // Get user's rooms to notify others
        const userRooms = await prisma.chatRoomMember.findMany({
          where: { userId: socket.userId },
          select: { chatRoomId: true }
        });

        // Notify other users in each room
        userRooms.forEach(({ chatRoomId }) => {
          socket.to(`room-${chatRoomId}`).emit('user-offline', {
            userId: socket.userId,
            userName: socket.user.name
          });
        });
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
};
