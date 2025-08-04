# CodeConnect Project Documentation

## 📊 Project Overview

**CodeConnect** is a Q&A platform for developers built with modern technologies.

### 🏗️ Architecture
```
Frontend (React + Tailwind + shadcn/ui)
    ↓
Backend (Node.js + Express + Prisma)
    ↓
Database (PostgreSQL)
```

## 🗄️ Database Schema & Relationships

### Core Models

#### User Model
```prisma
model User {
  id          Int       @id @default(autoincrement())
  email       String    @unique
  name        String?
  password    String
  role        UserRole  @default(USER)
  karmaPoints Int       @default(0)
  // Profile fields
  batch       String?
  classId     String?
  dept        String?
  expertise   String[]
  image       String?
  occupation  String?
  session     String?
  university  String?
  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  // Relations
  posts       Post[]
  comments    Comment[]
  votes       Vote[]
}
```

#### Post Model
```prisma
model Post {
  id           Int       @id @default(autoincrement())
  title        String
  content      String
  voteCount    Int       @default(0)
  bestAnswerId Int?      @unique
  // Foreign Keys
  userId       Int
  categoryId   Int
  // Timestamps
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  // Relations
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  category     Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  comments     Comment[]
  votes        Vote[]
  bestAnswer   Comment?  @relation("BestAnswer", fields: [bestAnswerId], references: [id])
}
```

#### Comment Model
```prisma
model Comment {
  id           Int      @id @default(autoincrement())
  content      String
  isBestAnswer Boolean  @default(false)
  voteCount    Int      @default(0)
  // Foreign Keys
  postId       Int
  userId       Int
  // Timestamps
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  // Relations
  post         Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  bestAnswerPost Post?  @relation("BestAnswer")
  votes        Vote[]
}
```

#### Vote Model
```prisma
model Vote {
  id        Int      @id @default(autoincrement())
  value     Int      // 1 for upvote, -1 for downvote
  // Foreign Keys (optional - can vote on post OR comment)
  postId    Int?
  commentId Int?
  userId    Int
  // Relations
  post      Post?    @relation(fields: [postId], references: [id], onDelete: Cascade)
  comment   Comment? @relation(fields: [commentId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### Category Model
```prisma
model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Relations
  posts     Post[]
}
```

### Relationships Diagram
```
User (1) ←→ (N) Post
User (1) ←→ (N) Comment  
User (1) ←→ (N) Vote
Post (1) ←→ (N) Comment
Post (1) ←→ (N) Vote
Comment (1) ←→ (N) Vote
Category (1) ←→ (N) Post
Post (1) ←→ (1) Comment (Best Answer)
```

## 🔌 API Endpoints Mapping

### Authentication Routes (`/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/logout` | User logout | Yes |

### Post Routes (`/api`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/posts` | Get all posts | No |
| GET | `/api/posts/:id` | Get single post | No |
| POST | `/api/posts` | Create new post | Yes |
| PATCH | `/api/posts/:id` | Update post | Yes |
| DELETE | `/api/posts/:id` | Delete post | Yes |

### Comment Routes (`/api/post`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/post/:postId/comments` | Get post comments | No |
| POST | `/api/post/:postId/comments` | Add comment | Yes |
| PATCH | `/api/post/:postId/comments/:id` | Update comment | Yes |
| DELETE | `/api/post/:postId/comments/:id` | Delete comment | Yes |

### Vote Routes (`/api`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/votes` | Vote on post/comment | Yes |
| DELETE | `/api/votes/:id` | Remove vote | Yes |

### Profile Routes (`/api`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profile` | Get user profile | Yes |
| PATCH | `/api/profile` | Update profile | Yes |
| GET | `/api/profile/:id` | Get other user profile | No |

### Admin Routes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/admin/users` | Get all users | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |
| GET | `/admin/categories` | Get all categories | Admin |
| POST | `/admin/categories` | Create category | Admin |
| PATCH | `/admin/categories/:id` | Update category | Admin |
| DELETE | `/admin/categories/:id` | Delete category | Admin |

## 🎨 Frontend Component Structure

### Core Components
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── AuthGuard.tsx
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostForm.tsx
│   │   └── PostDetail.tsx
│   ├── comments/
│   │   ├── CommentList.tsx
│   │   ├── CommentForm.tsx
│   │   └── CommentItem.tsx
│   ├── voting/
│   │   ├── VoteButton.tsx
│   │   └── VoteCounter.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   └── ProfileForm.tsx
│   └── admin/
│       ├── UserManagement.tsx
│       └── CategoryManagement.tsx
```

### Page Structure
```
src/
├── pages/
│   ├── Home.tsx              # Landing page
│   ├── Login.tsx             # Login page
│   ├── Register.tsx          # Register page
│   ├── Posts/
│   │   ├── index.tsx         # Posts list
│   │   ├── [id].tsx          # Single post
│   │   └── create.tsx        # Create post
│   ├── Profile/
│   │   ├── index.tsx         # User profile
│   │   └── [id].tsx          # Other user profile
│   └── Admin/
│       ├── Users.tsx         # User management
│       └── Categories.tsx    # Category management
```

## 🔄 State Management Structure

### Context Providers
```typescript
// AuthContext
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}

// PostContext
interface PostContextType {
  posts: Post[];
  loading: boolean;
  fetchPosts: () => Promise<void>;
  createPost: (postData: CreatePostData) => Promise<void>;
  updatePost: (id: number, postData: UpdatePostData) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
}

// VoteContext
interface VoteContextType {
  vote: (targetId: number, targetType: 'post' | 'comment', value: number) => Promise<void>;
  removeVote: (voteId: number) => Promise<void>;
}
```

## 🎨 Design System Implementation

### Color Palette
```css
/* Primary Colors */
--primary-blue: #2563eb;
--secondary-blue: #1d4ed8;
--accent-blue: #3b82f6;

/* Neutral Colors */
--background: #ffffff;
--secondary-bg: #f8fafc;
--border: #e2e8f0;
--text-primary: #1e293b;
--text-secondary: #64748b;

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Component Patterns
```typescript
// Card Pattern
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Button Pattern
const Button = ({ children, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

## 🔧 Development Workflow

### 1. Backend Development
```bash
# Start development server
npm run server

# Generate Prisma client
npm run generate

# Database operations
npm run clean
```

### 2. Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

### 3. Database Operations
```bash
# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🚨 Error Handling Patterns

### Backend Error Handling
```javascript
// Controller error handling
const handleError = (res, error) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  return res.status(500).json({ error: 'Internal server error' });
};
```

### Frontend Error Handling
```typescript
// API error handling
const apiCall = async (endpoint: string, options?: RequestInit) => {
  try {
    const response = await fetch(`/api${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

## 📝 Code Quality Standards

### Backend Standards
- Use async/await for database operations
- Implement proper error handling with try-catch
- Validate input data with Joi or similar
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Frontend Standards
- Use TypeScript for type safety
- Implement proper loading states
- Handle error boundaries
- Use semantic HTML
- Ensure accessibility compliance

### General Standards
- Follow consistent naming conventions
- Use meaningful commit messages
- Implement proper logging
- Write clean, readable code
- Add comments for complex logic

## 🔍 Testing Strategy

### Backend Testing
- Unit tests for controllers
- Integration tests for API endpoints
- Database operation tests
- Authentication flow tests

### Frontend Testing
- Component unit tests
- Integration tests for user flows
- API integration tests
- Accessibility tests

## 📊 Performance Optimization

### Backend Optimization
- Implement pagination for large datasets
- Use database indexing
- Optimize database queries
- Implement caching strategies

### Frontend Optimization
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Performance monitoring

---

**Note**: This documentation should be updated as the project evolves. Always refer to the latest version for current implementation details. 