import prisma from '../../DB/db.config.js';
import { hash } from 'bcrypt';

const categoriesList = [
  'Web',
  'App',
  'Machine Learning',
  'Blockchain',
  'DevOps',
  'Artificial Intelligence',
  'Competitive Programming',
  'Data Structure & Algorithm',
];

const usersList = [
  { name: 'Alex Johnson', email: 'alex.johnson@example.com', classId: '12108036', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'MIT', occupation: 'Student', expertise: ['Web', 'DevOps'], image: 'https://avatar.com/alex-johnson' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com', classId: '12108042', session: '2021-2025', batch: '2021', dept: 'AI', university: 'IIT Delhi', occupation: 'Research Assistant', expertise: ['Machine Learning', 'Artificial Intelligence'], image: 'https://avatar.com/priya-sharma' },
  { name: 'Mike Chen', email: 'mike.chen@example.com', classId: '12108015', session: '2019-2023', batch: '2019', dept: 'CS', university: 'Stanford', occupation: 'DevOps Engineer', expertise: ['DevOps'], image: 'https://avatar.com/mike-chen' },
  { name: 'Sara Lopez', email: 'sara.lopez@example.com', classId: '12108078', session: '2022-2026', batch: '2022', dept: 'Mobile Dev', university: 'UCLA', occupation: 'Student', expertise: ['App'], image: 'https://avatar.com/sara-lopez' },
  { name: 'Rahul Patel', email: 'rahul.patel@example.com', classId: '12108029', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'BITS Pilani', occupation: 'Competitive Programmer', expertise: ['Competitive Programming'], image: 'https://avatar.com/rahul-patel' },
  { name: 'Emily Davis', email: 'emily.davis@example.com', classId: '12108055', session: '2021-2025', batch: '2021', dept: 'AI', university: 'Caltech', occupation: 'AI Researcher', expertise: ['Artificial Intelligence'], image: 'https://avatar.com/emily-davis' },
  { name: 'Omar Khan', email: 'omar.khan@example.com', classId: '12108003', session: '2018-2022', batch: '2018', dept: 'CS', university: 'NUS', occupation: 'Blockchain Developer', expertise: ['Blockchain'], image: 'https://avatar.com/omar-khan' },
  { name: 'Liam Nguyen', email: 'liam.nguyen@example.com', classId: '12108099', session: '2022-2026', batch: '2022', dept: 'CS', university: 'UC Berkeley', occupation: 'Student', expertise: ['Data Structure & Algorithm'], image: 'https://avatar.com/liam-nguyen' },
];

const postList = [
  {
    category: 'Web',
    title: 'Next.js Dynamic Route Caching Issue',
    content: `I'm having trouble with ISR in Next.js 14. My dynamic routes aren't regenerating properly:\n\`\`\`javascript\nexport async function getStaticProps({ params }) {\n  const data = await fetchData(params.id);\n  return { props: { data }, revalidate: 60 };\n}\n\`\`\`\nThe page shows stale data even after 60 seconds. Any solutions?`,
    userEmail: 'alex.johnson@example.com',
    comments: [
      { content: `Make sure you're using the correct revalidation approach. Try adding:\n\`\`\`javascript\nexport const dynamicParams = true;\n\`\`\`\nAnd check your CDN configuration.`, userEmail: 'sara.lopez@example.com', votes: 5, isBestAnswer: true },
      { content: 'Have you tried clearing the Next.js cache?', userEmail: 'mike.chen@example.com', votes: -2 },
    ],
    votes: 8,
  },
  {
    category: 'App',
    title: 'Flutter TextField Losing Focus Randomly',
    content: `In my Flutter app, the TextField loses focus after typing a few characters:\n\`\`\`dart\nTextField(controller: _controller)\n\`\`\`\nIt's inside a StatefulWidget. How do I keep focus?`,
    userEmail: 'sara.lopez@example.com',
    comments: [
      { content: `Wrap it in a FocusScope:\n\`\`\`dart\nFocusScope(child: TextField(controller: _controller))\n\`\`\`\nThis keeps the focus stable.`, userEmail: 'alex.johnson@example.com', votes: 4, isBestAnswer: true },
      { content: 'Might be a keyboard issue—check your emulator.', userEmail: 'liam.nguyen@example.com', votes: 1 },
    ],
    votes: 6,
  },
  {
    category: 'Machine Learning',
    title: 'PyTorch Gradient Explosion in Transformer Model',
    content: `Training loss becomes NaN after a few iterations:\n\`\`\`python\nmodel = Transformer(d_model=512, nhead=8, num_encoder_layers=6)\noptimizer = AdamW(model.parameters(), lr=1e-3)\n\`\`\`\nGradient clipping doesn't help. Any suggestions?`,
    userEmail: 'priya.sharma@example.com',
    comments: [
      { content: `Lower the learning rate to 1e-5 and add:\n\`\`\`python\ntorch.nn.utils.clip_grad_norm_(model.parameters(), 0.5)\n\`\`\`\nAlso use layer normalization.`, userEmail: 'emily.davis@example.com', votes: 12, isBestAnswer: true },
      { content: 'Check your input data for NaN values first.', userEmail: 'omar.khan@example.com', votes: 3 },
    ],
    votes: 15,
  },
  {
    category: 'Blockchain',
    title: 'Smart Contract Transfer Function Failing',
    content: `My Solidity transfer function reverts without an error:\n\`\`\`solidity\nfunction transfer(address to, uint amount) public { balance[to] += amount; }\n\`\`\`\nUsing Hardhat for testing. Any clues?`,
    userEmail: 'omar.khan@example.com',
    comments: [
      { content: `You need a balance check:\n\`\`\`solidity\nfunction transfer(address to, uint amount) public { require(balance[msg.sender] >= amount); balance[to] += amount; }\n\`\`\`\nThat should fix it.`, userEmail: 'mike.chen@example.com', votes: 7, isBestAnswer: true },
      { content: 'Are you deploying to the right network?', userEmail: 'rahul.patel@example.com', votes: 2 },
    ],
    votes: 10,
  },
  {
    category: 'DevOps',
    title: 'GitHub Actions Workflow Failing Silently',
    content: `My CI pipeline runs but doesn't deploy:\n\`\`\`yaml\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n\`\`\`\nNo error logs—how do I debug?`,
    userEmail: 'mike.chen@example.com',
    comments: [
      { content: `Add a debug step:\n\`\`\`yaml\n- run: echo "Deploying..."\n\`\`\`\nCheck the raw logs in GitHub Actions.`, userEmail: 'alex.johnson@example.com', votes: 6, isBestAnswer: true },
      { content: 'Could be a permissions issue.', userEmail: 'priya.sharma@example.com', votes: 1 },
    ],
    votes: 9,
  },
  {
    category: 'Artificial Intelligence',
    title: 'Q-Learning Agent Not Converging',
    content: `Training a Q-learning agent, but rewards stay flat:\n\`\`\`python\nQ[state, action] += alpha * (reward + gamma * np.max(Q[next_state]) - Q[state, action])\n\`\`\`\nAlpha=0.1, gamma=0.9. Suggestions?`,
    userEmail: 'emily.davis@example.com',
    comments: [
      { content: `Increase exploration with epsilon-greedy:\n\`\`\`python\nif random.random() < epsilon: action = random.choice(actions)\n\`\`\`\nTry epsilon=0.1.`, userEmail: 'priya.sharma@example.com', votes: 8, isBestAnswer: true },
      { content: 'Check your reward function—it might be too sparse.', userEmail: 'liam.nguyen@example.com', votes: 3 },
    ],
    votes: 11,
  },
  {
    category: 'Competitive Programming',
    title: 'TLE on Recursive Fibonacci Solution',
    content: `My recursive Fibonacci times out on large inputs:\n\`\`\`cpp\nint fib(int n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }\n\`\`\`\nHow do I optimize for n=50?`,
    userEmail: 'rahul.patel@example.com',
    comments: [
      { content: `Use memoization:\n\`\`\`cpp\nint fib(int n, vector<int>& dp) { if (n <= 1) return n; if (dp[n] != -1) return dp[n]; return dp[n] = fib(n-1, dp) + fib(n-2, dp); }\n\`\`\`\nCall with a dp vector initialized to -1.`, userEmail: 'liam.nguyen@example.com', votes: 10, isBestAnswer: true },
      { content: 'Iterative might be simpler for this.', userEmail: 'sara.lopez@example.com', votes: 2 },
    ],
    votes: 13,
  },
  {
    category: 'Data Structure & Algorithm',
    title: 'HashMap Collision Handling in Java',
    content: `My custom HashMap has too many collisions:\n\`\`\`java\nint hash = key.hashCode() % capacity;\n\`\`\`\nShould I use a different hash function?`,
    userEmail: 'liam.nguyen@example.com',
    comments: [
      { content: `Try a better hash:\n\`\`\`java\nint hash = (key.hashCode() * 31) % capacity;\n\`\`\`\n31 is a prime number, reduces collisions.`, userEmail: 'rahul.patel@example.com', votes: 9, isBestAnswer: true },
      { content: 'Increase capacity to reduce load factor.', userEmail: 'emily.davis@example.com', votes: 4 },
    ],
    votes: 12,
  },
];

function randomDate() {
  const now = new Date();
  const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 3 months ago
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

export const seedDatabase = async (req, res) => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Check existing data
    const existingUsers = await prisma.user.count();
    const existingCategories = await prisma.category.count();
    const existingPosts = await prisma.post.count();
    
    console.log(`📊 Existing data: ${existingUsers} users, ${existingCategories} categories, ${existingPosts} posts`);
    
    // Only clear sample data, preserve existing admin users
    console.log('🗑️ Clearing only sample data (preserving existing users)...');
    await prisma.vote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    
    // Don't delete users - preserve existing admin and users

    // Create categories
    console.log('📂 Creating categories...');
    const categories = await Promise.all(
      categoriesList.map((name) => prisma.category.create({ data: { name } }))
    );

    // Create sample users (skip if they already exist)
    console.log('👥 Creating sample users (skipping existing ones)...');
    const users = [];
    
    for (const userData of usersList) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (existingUser) {
        console.log(`⏭️ Skipping existing user: ${userData.email}`);
        users.push(existingUser);
      } else {
        console.log(`➕ Creating new user: ${userData.email}`);
        const newUser = await prisma.user.create({
          data: {
            email: userData.email,
            name: userData.name,
            password: await hash('SecurePass123!', 10), // Hash the password
            role: 'USER', // Don't create admin users - preserve existing admin
            classId: userData.classId,
            session: userData.session,
            batch: userData.batch,
            dept: userData.dept,
            university: userData.university,
            occupation: userData.occupation,
            expertise: userData.expertise,
            image: userData.image,
            karmaPoints: Math.floor(Math.random() * 100) + 50,
            createdAt: randomDate(),
            isEmailVerified: true, // Set all users as verified for demo
          },
        });
        users.push(newUser);
      }
    }

    // Create posts with comments and votes
    console.log('📝 Creating posts and comments...');
    for (const postData of postList) {
      const author = users.find((u) => u.email === postData.userEmail);
      const category = categories.find((c) => c.name === postData.category);

      const post = await prisma.post.create({
        data: {
          title: postData.title,
          content: postData.content,
          categoryId: category.id,
          userId: author.id,
          voteCount: postData.votes,
          createdAt: randomDate(),
        },
      });

      // Create comments with votes
      for (const commentData of postData.comments) {
        const commentAuthor = users.find((u) => u.email === commentData.userEmail);
        const comment = await prisma.comment.create({
          data: {
            content: commentData.content,
            postId: post.id,
            userId: commentAuthor.id,
            voteCount: commentData.votes,
            isBestAnswer: commentData.isBestAnswer,
            createdAt: new Date(post.createdAt.getTime() + 3600000), // 1 hour later
          },
        });

        if (commentData.isBestAnswer) {
          await prisma.post.update({
            where: { id: post.id },
            data: { bestAnswerId: comment.id },
          });
        }

        // Simulate additional voting
        for (let i = 0; i < Math.abs(commentData.votes); i++) {
          const voter = users[Math.floor(Math.random() * users.length)];
          await prisma.vote.create({
            data: {
              value: commentData.votes > 0 ? 1 : -1,
              commentId: comment.id,
              userId: voter.id,
            },
          });
        }
      }

      // Simulate post votes
      for (let i = 0; i < Math.abs(postData.votes); i++) {
        const voter = users[Math.floor(Math.random() * users.length)];
        await prisma.vote.create({
          data: {
            value: postData.votes > 0 ? 1 : -1,
            postId: post.id,
            userId: voter.id,
          },
        });
      }
    }

    console.log('✅ Database seeded successfully!');
    
    res.json({
      success: true,
      message: 'Sample data added successfully! (Existing users preserved)',
      stats: {
        users: users.length,
        categories: categories.length,
        posts: postList.length,
        comments: postList.reduce((sum, p) => sum + p.comments.length, 0),
        votes: postList.reduce((sum, p) => sum + Math.abs(p.votes) + p.comments.reduce((cSum, c) => cSum + Math.abs(c.votes), 0), 0),
        note: 'Existing admin users and data were preserved'
      }
    });
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      details: error.message
    });
  }
};

export const clearDatabase = async (req, res) => {
  try {
    console.log('🗑️ Clearing all database data...');
    
    await prisma.vote.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Database cleared successfully!');
    
    res.json({
      success: true,
      message: 'Database cleared successfully!'
    });
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      details: error.message
    });
  }
};
