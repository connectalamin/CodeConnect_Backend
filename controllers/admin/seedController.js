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
  { name: 'Arif Rahman', email: 'arif.rahman@example.com', classId: '12108036', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'BUET', occupation: 'Student', expertise: ['Web', 'DevOps'], image: 'https://avatar.com/arif-rahman' },
  { name: 'Fatima Khatun', email: 'fatima.khatun@example.com', classId: '12108042', session: '2021-2025', batch: '2021', dept: 'CSE', university: 'University of Dhaka', occupation: 'Research Assistant', expertise: ['Machine Learning', 'Artificial Intelligence'], image: 'https://avatar.com/fatima-khatun' },
  { name: 'Md. Karim Uddin', email: 'karim.uddin@example.com', classId: '12108015', session: '2019-2023', batch: '2019', dept: 'CSE', university: 'BUET', occupation: 'DevOps Engineer', expertise: ['DevOps'], image: 'https://avatar.com/karim-uddin' },
  { name: 'Rashida Begum', email: 'rashida.begum@example.com', classId: '12108078', session: '2022-2026', batch: '2022', dept: 'CSE', university: 'Comilla University', occupation: 'Student', expertise: ['App'], image: 'https://avatar.com/rashida-begum' },
  { name: 'Tanvir Hasan', email: 'tanvir.hasan@example.com', classId: '12108029', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'BUET', occupation: 'Competitive Programmer', expertise: ['Competitive Programming'], image: 'https://avatar.com/tanvir-hasan' },
  { name: 'Nasreen Akter', email: 'nasreen.akter@example.com', classId: '12108055', session: '2021-2025', batch: '2021', dept: 'CSE', university: 'University of Dhaka', occupation: 'AI Researcher', expertise: ['Artificial Intelligence'], image: 'https://avatar.com/nasreen-akter' },
  { name: 'Md. Omar Faruk', email: 'omar.faruk@example.com', classId: '12108003', session: '2018-2022', batch: '2018', dept: 'CSE', university: 'University of Dhaka', occupation: 'Blockchain Developer', expertise: ['Blockchain'], image: 'https://avatar.com/omar-faruk' },
  { name: 'Shariful Islam', email: 'shariful.islam@example.com', classId: '12108099', session: '2022-2026', batch: '2022', dept: 'CSE', university: 'BUET', occupation: 'Student', expertise: ['Data Structure & Algorithm'], image: 'https://avatar.com/shariful-islam' },
  { name: 'Ayesha Siddique', email: 'ayesha.siddique@example.com', classId: '12108101', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'Jahangirnagar University', occupation: 'Software Engineer', expertise: ['Web', 'DevOps'], image: 'https://avatar.com/ayesha-siddique' },
  { name: 'Md. Rafiqul Islam', email: 'rafiqul.islam@example.com', classId: '12108102', session: '2019-2023', batch: '2019', dept: 'CSE', university: 'University of Chittagong', occupation: 'ML Engineer', expertise: ['Machine Learning', 'Artificial Intelligence'], image: 'https://avatar.com/rafiqul-islam' },
  { name: 'Sadia Sultana', email: 'sadia.sultana@example.com', classId: '12108103', session: '2021-2025', batch: '2021', dept: 'CSE', university: 'Comilla University', occupation: 'Research Assistant', expertise: ['Data Structure & Algorithm'], image: 'https://avatar.com/sadia-sultana' },
  { name: 'Ruma Parvin', email: 'ruma.parvin@example.com', classId: '12108104', session: '2022-2026', batch: '2022', dept: 'CSE', university: 'University of Rajshahi', occupation: 'Student', expertise: ['App'], image: 'https://avatar.com/ruma-parvin' },
  { name: 'Md. Abdul Kadir', email: 'abdul.kadir@example.com', classId: '12108105', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'BUET', occupation: 'DevOps Engineer', expertise: ['DevOps', 'Blockchain'], image: 'https://avatar.com/abdul-kadir' },
  { name: 'Sultana Razia', email: 'sultana.razia@example.com', classId: '12108106', session: '2021-2025', batch: '2021', dept: 'CSE', university: 'University of Dhaka', occupation: 'AI Researcher', expertise: ['Machine Learning'], image: 'https://avatar.com/sultana-razia' },
  { name: 'Md. Aminul Islam', email: 'aminul.islam@example.com', classId: '12108107', session: '2019-2023', batch: '2019', dept: 'CSE', university: 'Jahangirnagar University', occupation: 'Full Stack Developer', expertise: ['Web'], image: 'https://avatar.com/aminul-islam' },
  { name: 'Farzana Yasmin', email: 'farzana.yasmin@example.com', classId: '12108108', session: '2022-2026', batch: '2022', dept: 'CSE', university: 'University of Chittagong', occupation: 'Student', expertise: ['Competitive Programming'], image: 'https://avatar.com/farzana-yasmin' },
  { name: 'Md. Jubair Ahmed', email: 'jubair.ahmed@example.com', classId: '12108109', session: '2020-2024', batch: '2020', dept: 'CSE', university: 'BUET', occupation: 'Software Engineer', expertise: ['Web', 'App'], image: 'https://avatar.com/jubair-ahmed' },
  { name: 'Salma Akter', email: 'salma.akter@example.com', classId: '12108110', session: '2021-2025', batch: '2021', dept: 'CSE', university: 'University of Dhaka', occupation: 'Data Scientist', expertise: ['Machine Learning', 'Data Structure & Algorithm'], image: 'https://avatar.com/salma-akter' },
  { name: 'Md. Hasanuzzaman', email: 'hasanuzzaman@example.com', classId: '12108111', session: '2019-2023', batch: '2019', dept: 'CSE', university: 'Comilla University', occupation: 'Blockchain Developer', expertise: ['Blockchain'], image: 'https://avatar.com/hasanuzzaman' },
  { name: 'Tahura Begum', email: 'tahura.begum@example.com', classId: '12108112', session: '2022-2026', batch: '2022', dept: 'CSE', university: 'University of Rajshahi', occupation: 'Student', expertise: ['App', 'DevOps'], image: 'https://avatar.com/tahura-begum' },
];

const postList = [
  {
    category: 'Web',
    title: 'Next.js Dynamic Route Caching Issue',
    content: `I'm having trouble with ISR in Next.js 14. My dynamic routes aren't regenerating properly:\n\`\`\`javascript\nexport async function getStaticProps({ params }) {\n  const data = await fetchData(params.id);\n  return { props: { data }, revalidate: 60 };\n}\n\`\`\`\nThe page shows stale data even after 60 seconds. Any solutions?`,
    userEmail: 'arif.rahman@example.com',
    comments: [
      { content: `Make sure you're using the correct revalidation approach. Try adding:\n\`\`\`javascript\nexport const dynamicParams = true;\n\`\`\`\nAnd check your CDN configuration.`, userEmail: 'rashida.begum@example.com', votes: 5, isBestAnswer: true },
      { content: 'Have you tried clearing the Next.js cache?', userEmail: 'karim.uddin@example.com', votes: -2 },
      { content: 'Check if you have any middleware that might be caching responses.', userEmail: 'ayesha.siddique@example.com', votes: 3 },
      { content: 'This could be a CDN issue. Are you using Vercel or Netlify?', userEmail: 'jubair.ahmed@example.com', votes: 2 },
    ],
    votes: 8,
  },
  {
    category: 'App',
    title: 'Flutter TextField Losing Focus Randomly',
    content: `In my Flutter app, the TextField loses focus after typing a few characters:\n\`\`\`dart\nTextField(controller: _controller)\n\`\`\`\nIt's inside a StatefulWidget. How do I keep focus?`,
    userEmail: 'rashida.begum@example.com',
    comments: [
      { content: `Wrap it in a FocusScope:\n\`\`\`dart\nFocusScope(child: TextField(controller: _controller))\n\`\`\`\nThis keeps the focus stable.`, userEmail: 'arif.rahman@example.com', votes: 4, isBestAnswer: true },
      { content: 'Might be a keyboard issue—check your emulator.', userEmail: 'shariful.islam@example.com', votes: 1 },
    ],
    votes: 6,
  },
  {
    category: 'Machine Learning',
    title: 'PyTorch Gradient Explosion in Transformer Model',
    content: `Training loss becomes NaN after a few iterations:\n\`\`\`python\nmodel = Transformer(d_model=512, nhead=8, num_encoder_layers=6)\noptimizer = AdamW(model.parameters(), lr=1e-3)\n\`\`\`\nGradient clipping doesn't help. Any suggestions?`,
    userEmail: 'fatima.khatun@example.com',
    comments: [
      { content: `Lower the learning rate to 1e-5 and add:\n\`\`\`python\ntorch.nn.utils.clip_grad_norm_(model.parameters(), 0.5)\n\`\`\`\nAlso use layer normalization.`, userEmail: 'nasreen.akter@example.com', votes: 12, isBestAnswer: true },
      { content: 'Check your input data for NaN values first.', userEmail: 'omar.faruk@example.com', votes: 3 },
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

// Generate additional posts to reach 50+ posts
const generateMorePosts = () => {
  const additionalPosts = [];
  const morePostTemplates = [
    {
      category: 'Web',
      title: 'React useEffect infinite loop',
      content: `My useEffect is causing infinite re-renders:\n\`\`\`javascript\nuseEffect(() => {\n  setData(fetchData());\n}, [data]);\n\`\`\`\nHow do I fix this?`,
      userEmail: 'ayesha.siddique@example.com',
      comments: [
        { content: 'Remove data from the dependency array or use useCallback', userEmail: 'aminul.islam@example.com', votes: 8, isBestAnswer: true },
        { content: 'You should probably use async/await properly', userEmail: 'rafiqul.islam@example.com', votes: 3 },
        { content: 'Consider using React Query for data fetching', userEmail: 'ruma.parvin@example.com', votes: 5 },
      ],
      votes: 12,
    },
    {
      category: 'Machine Learning',
      title: 'TensorFlow model not converging',
      content: `My neural network loss is not decreasing:\n\`\`\`python\nmodel = tf.keras.Sequential([\n  tf.keras.layers.Dense(128, activation='relu'),\n  tf.keras.layers.Dense(1)\n])\n\`\`\`\nAny suggestions?`,
      userEmail: 'rafiqul.islam@example.com',
      comments: [
        { content: 'Try adjusting the learning rate. Start with 0.001', userEmail: 'salma.akter@example.com', votes: 7, isBestAnswer: true },
        { content: 'Add regularization and dropout layers', userEmail: 'nasreen.akter@example.com', votes: 4 },
        { content: 'Check your data preprocessing and normalization', userEmail: 'sultana.razia@example.com', votes: 6 },
      ],
      votes: 10,
    },
    {
      category: 'App',
      title: 'React Native navigation not working',
      content: `Navigation between screens is broken:\n\`\`\`javascript\nnavigation.navigate('HomeScreen');\n\`\`\`\nGetting undefined is not an object error.`,
      userEmail: 'ruma.parvin@example.com',
      comments: [
        { content: 'Make sure you have NavigationContainer wrapping your app', userEmail: 'tahura.begum@example.com', votes: 9, isBestAnswer: true },
        { content: 'Check if you have the latest version of React Navigation', userEmail: 'rashida.begum@example.com', votes: 2 },
        { content: 'Verify your screen names in the navigator', userEmail: 'abdul.kadir@example.com', votes: 3 },
      ],
      votes: 15,
    },
    {
      category: 'Blockchain',
      title: 'Smart contract gas optimization',
      content: `My Solidity contract is using too much gas:\n\`\`\`solidity\nfunction transfer(address to, uint amount) public {\n  require(balances[msg.sender] >= amount);\n  balances[msg.sender] -= amount;\n  balances[to] += amount;\n}\n\`\`\`\nHow to optimize?`,
      userEmail: 'hasanuzzaman@example.com',
      comments: [
        { content: 'Use assembly for gas-efficient operations', userEmail: 'omar.faruk@example.com', votes: 6, isBestAnswer: true },
        { content: 'Pack your structs properly to save storage', userEmail: 'abdul.kadir@example.com', votes: 4 },
        { content: 'Consider using SafeMath alternatives', userEmail: 'aminul.islam@example.com', votes: 2 },
      ],
      votes: 8,
    },
    {
      category: 'DevOps',
      title: 'Docker container memory issues',
      content: `My Node.js app in Docker keeps running out of memory:\n\`\`\`dockerfile\nFROM node:16\nCOPY . .\nRUN npm install\nCMD ["npm", "start"]\n\`\`\`\nAny solutions?`,
      userEmail: 'karim.uddin@example.com',
      comments: [
        { content: 'Set memory limits in your docker-compose or k8s manifests', userEmail: 'abdul.kadir@example.com', votes: 7, isBestAnswer: true },
        { content: 'Use multi-stage builds to reduce image size', userEmail: 'ayesha.siddique@example.com', votes: 5 },
        { content: 'Check for memory leaks in your Node.js code', userEmail: 'jubair.ahmed@example.com', votes: 3 },
      ],
      votes: 11,
    },
  ];

  // Create multiple variations of each template
  for (let i = 0; i < 10; i++) {
    for (const template of morePostTemplates) {
      const randomUser = usersList[Math.floor(Math.random() * usersList.length)];
      const post = {
        ...template,
        title: template.title + ` (Case ${i + 1})`,
        userEmail: randomUser.email,
        votes: Math.floor(Math.random() * 20) + 1,
        comments: template.comments.map(comment => ({
          ...comment,
          votes: Math.floor(Math.random() * 10) - 2, // -2 to 7
          userEmail: usersList[Math.floor(Math.random() * usersList.length)].email
        }))
      };
      additionalPosts.push(post);
    }
  }

  return additionalPosts;
};

// Combine original posts with generated ones
const allPosts = [...postList, ...generateMorePosts()];

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
    for (const postData of allPosts) {
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
        posts: allPosts.length,
        comments: allPosts.reduce((sum, p) => sum + p.comments.length, 0),
        votes: allPosts.reduce((sum, p) => sum + Math.abs(p.votes) + p.comments.reduce((cSum, c) => cSum + Math.abs(c.votes), 0), 0),
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
