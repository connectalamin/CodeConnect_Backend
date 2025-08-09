import prisma from '../DB/db.config.js';

const defaultChatRooms = [
  {
    name: "Frontend Discussions",
    description: "General discussions about frontend development, frameworks, and best practices",
    category: "Frontend",
    maxMembers: 500
  },
  {
    name: "React Hub",
    description: "Everything React.js - components, hooks, state management, and more",
    category: "Frontend",
    maxMembers: 300
  },
  {
    name: "Vue.js Community",
    description: "Vue.js developers unite! Discuss Vue 3, Nuxt, and ecosystem tools",
    category: "Frontend",
    maxMembers: 200
  },
  {
    name: "Backend Central",
    description: "Server-side development, APIs, databases, and architecture discussions",
    category: "Backend",
    maxMembers: 400
  },
  {
    name: "Node.js & Express",
    description: "Node.js and Express.js development, middleware, and performance tips",
    category: "Backend",
    maxMembers: 250
  },
  {
    name: "Database Design",
    description: "SQL, NoSQL, database design patterns, and optimization techniques",
    category: "Backend",
    maxMembers: 200
  },
  {
    name: "General Programming",
    description: "Programming concepts, algorithms, data structures, and coding practices",
    category: "Programming",
    maxMembers: 600
  },
  {
    name: "Code Review & Help",
    description: "Get help with your code, debugging, and code review requests",
    category: "Programming",
    maxMembers: 400
  },
  {
    name: "Career & Learning",
    description: "Programming career advice, learning resources, and skill development",
    category: "Programming",
    maxMembers: 300
  }
];

async function seedDefaultChatRooms() {
  try {
    console.log('Starting to seed default chat rooms...');

    // Find an admin user to be the creator (or create a system user)
    let systemUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!systemUser) {
      // Create a system admin user if none exists
      systemUser = await prisma.user.create({
        data: {
          name: 'System',
          email: 'system@codeconnect.com',
          password: 'system_password_hash', // In real app, this should be properly hashed
          role: 'ADMIN',
          isEmailVerified: true
        }
      });
      console.log('Created system admin user');
    }

    for (const roomData of defaultChatRooms) {
      // Check if room already exists
      const existingRoom = await prisma.chatRoom.findFirst({
        where: {
          name: roomData.name,
          category: roomData.category
        }
      });

      if (!existingRoom) {
        // Create the room
        const room = await prisma.chatRoom.create({
          data: {
            ...roomData,
            isPrivate: false,
            createdById: systemUser.id
          }
        });

        // Add system user as admin member
    await prisma.chatRoomMember.create({
          data: {
      chatRoomId: room.id,
            userId: systemUser.id,
            role: 'ADMIN'
          }
        });

        console.log(`Created room: ${roomData.name}`);
      } else {
        console.log(`Room already exists: ${roomData.name}`);
      }
    }

    console.log('Default chat rooms seeding completed!');
  } catch (error) {
    console.error('Error seeding default chat rooms:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDefaultChatRooms()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
