import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function seedChatRooms() {
  console.log('Starting chat room seeding...');

  try {
    // Get some existing users for seed data
    const users = await prisma.user.findMany({ take: 5 });
    
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    // Create public chat rooms
    const publicRooms = [
      {
        name: "React Development",
        description: "Discuss React, hooks, and modern frontend development",
        category: "Frontend",
        isPrivate: false,
        createdById: users[0].id
      },
      {
        name: "Node.js Backend",
        description: "Server-side development with Node.js and Express",
        category: "Backend",
        isPrivate: false,
        createdById: users[1].id
      },
      {
        name: "TypeScript Tips",
        description: "Advanced TypeScript patterns and best practices",
        category: "Programming",
        isPrivate: false,
        createdById: users[2].id
      },
      {
        name: "Database Design",
        description: "SQL, NoSQL, and database optimization discussions",
        category: "Backend",
        isPrivate: false,
        createdById: users[0].id
      },
      {
        name: "UI/UX Design",
        description: "Frontend design patterns and user experience",
        category: "Frontend",
        isPrivate: false,
        createdById: users[1].id
      }
    ];

    // Create private chat rooms
    const privateRooms = [
      {
        name: "Project Alpha",
        description: "Private room for Project Alpha team",
        category: "General",
        isPrivate: true,
        joinCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
        createdById: users[2].id
      },
      {
        name: "Study Group",
        description: "Study group for algorithms and data structures",
        category: "General",
        isPrivate: true,
        joinCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
        createdById: users[3].id
      }
    ];

    // Create public rooms
    for (const roomData of publicRooms) {
      const room = await prisma.chatRoom.create({
        data: roomData
      });

      // Add creator as admin member
      await prisma.chatRoomMember.create({
        data: {
          userId: roomData.createdById,
          chatRoomId: room.id,
          role: 'ADMIN'
        }
      });

      // Add a few other users as members
      for (let i = 0; i < Math.min(3, users.length - 1); i++) {
        const user = users[(i + 1) % users.length];
        if (user.id !== roomData.createdById) {
          await prisma.chatRoomMember.create({
            data: {
              userId: user.id,
              chatRoomId: room.id,
              role: 'MEMBER'
            }
          });
        }
      }

      // Add some sample messages
      const sampleMessages = [
        `Welcome to ${room.name}! Let's start discussing.`,
        'This is a great place to share knowledge and learn from each other.',
        'Feel free to ask questions and share your experiences.',
      ];

      for (let i = 0; i < sampleMessages.length; i++) {
        await prisma.chatMessage.create({
          data: {
            content: sampleMessages[i],
            userId: users[i % users.length].id,
            chatRoomId: room.id
          }
        });
      }

      console.log(`Created public room: ${room.name}`);
    }

    // Create private rooms
    for (const roomData of privateRooms) {
      const room = await prisma.chatRoom.create({
        data: roomData
      });

      // Add creator as admin member
      await prisma.chatRoomMember.create({
        data: {
          userId: roomData.createdById,
          chatRoomId: room.id,
          role: 'ADMIN'
        }
      });

      // Add one other user as member
      const otherUser = users.find(u => u.id !== roomData.createdById);
      if (otherUser) {
        await prisma.chatRoomMember.create({
          data: {
            userId: otherUser.id,
            chatRoomId: room.id,
            role: 'MEMBER'
          }
        });
      }

      // Add a welcome message
      await prisma.chatMessage.create({
        data: {
          content: `Welcome to ${room.name}! This is a private room.`,
          userId: roomData.createdById,
          chatRoomId: room.id
        }
      });

      console.log(`Created private room: ${room.name} (Code: ${room.joinCode})`);
    }

    console.log('Chat room seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding chat rooms:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedChatRooms();
