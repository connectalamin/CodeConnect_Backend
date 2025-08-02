# CodeConnect Development Quick Reference

## 🚀 Quick Start

### Backend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run server

# Generate Prisma client
npm run generate

# View database
npx prisma studio
```

### Frontend Setup (when implemented)
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Common Tasks

### Database Operations
```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Seed database
npm run seed

# View database schema
npx prisma format
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🔌 API Endpoints Quick Reference

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### Comments
- `GET /api/post/:postId/comments` - Get post comments
- `POST /api/post/:postId/comments` - Add comment
- `PATCH /api/post/:postId/comments/:id` - Update comment
- `DELETE /api/post/:postId/comments/:id` - Delete comment

### Votes
- `POST /api/votes` - Vote on post/comment
- `DELETE /api/votes/:id` - Remove vote

### Profile
- `GET /api/profile` - Get user profile
- `PATCH /api/profile` - Update profile

### Admin
- `GET /admin/users` - Get all users
- `DELETE /admin/users/:id` - Delete user
- `GET /admin/categories` - Get categories
- `POST /admin/categories` - Create category

## 🎨 Design System Quick Reference

### Colors
```css
/* Primary */
--primary-blue: #2563eb;
--secondary-blue: #1d4ed8;
--accent-blue: #3b82f6;

/* Neutral */
--background: #ffffff;
--secondary-bg: #f8fafc;
--border: #e2e8f0;
--text-primary: #1e293b;
--text-secondary: #64748b;

/* Semantic */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Tailwind Classes
```css
/* Cards */
bg-white rounded-lg shadow-md p-6 border border-gray-200

/* Buttons */
px-4 py-2 rounded-md font-medium transition-colors

/* Forms */
space-y-4

/* Layout */
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

## 🔧 Development Commands

### Backend
```bash
npm run server      # Start development server
npm run generate    # Generate Prisma client
npm run clean       # Clean database
```

### Frontend
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run lint        # Run linter
npm run test        # Run tests
```

## 📝 Code Patterns

### Backend Controller Pattern
```javascript
const controller = async (req, res) => {
  try {
    const { prisma } = req;
    
    // Database operation
    const result = await prisma.model.findMany();
    
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

### Frontend Component Pattern
```typescript
interface ComponentProps {
  // Define props
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Component content */}
    </div>
  );
};
```

## 🚨 Error Handling

### Backend Error Response
```javascript
{
  "error": "Error message",
  "status": 400,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Frontend Error Handling
```typescript
try {
  const response = await apiCall('/endpoint');
  // Handle success
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

## 🔍 Debugging

### Backend Debugging
```javascript
// Add to controllers
console.log('Request body:', req.body);
console.log('User:', req.user);
console.log('Database result:', result);
```

### Frontend Debugging
```typescript
// Add to components
console.log('Props:', props);
console.log('State:', state);
console.log('API response:', response);
```

## 📊 Database Queries

### Common Prisma Queries
```javascript
// Get posts with user and category
const posts = await prisma.post.findMany({
  include: {
    user: true,
    category: true,
    comments: {
      include: {
        user: true
      }
    }
  }
});

// Get user with posts
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    posts: true,
    comments: true
  }
});

// Vote on post
const vote = await prisma.vote.create({
  data: {
    value: 1, // 1 for upvote, -1 for downvote
    postId: postId,
    userId: userId
  }
});
```

## 🎯 Testing

### Backend Testing
```javascript
// Test API endpoint
const response = await request(app)
  .post('/api/posts')
  .send(postData)
  .expect(201);
```

### Frontend Testing
```typescript
// Test component
render(<Component prop1="value" />);
expect(screen.getByText('Expected text')).toBeInTheDocument();
```

## 📈 Performance Tips

### Backend
- Use database indexing
- Implement pagination
- Cache frequently accessed data
- Optimize database queries

### Frontend
- Use React.memo for expensive components
- Implement lazy loading
- Optimize bundle size
- Use proper image formats

---

**Remember**: Always refer to the main `PROJECT_INSTRUCTIONS.md` and `PROJECT_DOCUMENTATION.md` files for detailed information. 