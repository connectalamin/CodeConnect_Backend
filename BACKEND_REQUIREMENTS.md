# CodeConnect Backend Requirements

## 🎯 Overview
This document outlines the backend requirements for the new features being added to CodeConnect. These features include Leaderboard, Notification System, and Saved Posts functionality.

## 📋 New Features Backend Requirements

### 1. Leaderboard System

#### Database Schema Changes
```sql
-- Note: karmaPoints already exists in User model, no changes needed
-- The existing User model already has: karmaPoints Int @default(0)

-- Create leaderboard_history table for tracking historical rankings
CREATE TABLE leaderboard_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    karma_points INTEGER NOT NULL,
    rank_position INTEGER NOT NULL,
    period_type VARCHAR(20) NOT NULL, -- 'weekly', 'monthly', 'all_time'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_achievements table
CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL, -- 'top_10', 'top_50', 'first_post', etc.
    achievement_name VARCHAR(100) NOT NULL,
    achievement_description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints
```javascript
// GET /api/leaderboard
// Get leaderboard rankings
{
  "period": "weekly" | "monthly" | "all_time",
  "limit": 10 | 50 | 100,
  "page": 1
}

// Response
{
  "success": true,
  "data": {
    "period": "weekly",
    "rankings": [
      {
        "rank": 1,
        "user": {
          "id": 1,
          "name": "John Doe",
          "image": "url",
          "role": "USER",
          "karmaPoints": 1250,
          "expertise": ["React", "JavaScript"]
        },
        "karma_points": 1250,
        "achievements": ["top_10", "first_post"]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_users": 150
    }
  }
}

// GET /api/leaderboard/user/:userId
// Get specific user's ranking
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "karmaPoints": 850,
      "expertise": ["React", "JavaScript"],
      "batch": "2020",
      "dept": "CSE",
      "university": "Comilla University"
    },
    "current_rank": 15,
    "karma_points": 850,
    "rank_history": [...],
    "achievements": [...]
  }
}
```

#### Karma Points Calculation Logic
```javascript
// Karma points calculation rules (integrate with existing vote system)
const karmaRules = {
  post_upvoted: 1,
  post_downvoted: -1,
  comment_upvoted: 1,
  comment_downvoted: -1,
  best_answer_marked: 10
  // Note: Creating posts and comments gives 0 points
};

// Integration with existing Vote model
// When a vote is created/updated, calculate karma points
const updateKarmaOnVote = async (voteData) => {
  const { value, postId, commentId, userId } = voteData;
  
  if (postId) {
    // Vote on post
    const points = value === 1 ? karmaRules.post_upvoted : karmaRules.post_downvoted;
    await updateUserKarma(userId, points);
  } else if (commentId) {
    // Vote on comment
    const points = value === 1 ? karmaRules.comment_upvoted : karmaRules.comment_downvoted;
    await updateUserKarma(userId, points);
  }
};

// Military rank system
const ranks = [
  { threshold: 25000, rank: 'Field Marshal', badge: 'gold' },
  { threshold: 10000, rank: 'Marshal', badge: 'gold' },
  { threshold: 7000, rank: 'General', badge: 'gold' },
  { threshold: 5000, rank: 'Lieutenant General', badge: 'gold' },
  { threshold: 3000, rank: 'Major General', badge: 'silver' },
  { threshold: 2000, rank: 'Brigadier General', badge: 'silver' },
  { threshold: 1300, rank: 'Colonel', badge: 'silver' },
  { threshold: 800, rank: 'Lieutenant Colonel', badge: 'silver' },
  { threshold: 400, rank: 'Major', badge: 'bronze' },
  { threshold: 200, rank: 'Captain', badge: 'bronze' },
  { threshold: 100, rank: 'Lieutenant', badge: 'bronze' },
  { threshold: 50, rank: 'Sergeant', badge: 'bronze' },
  { threshold: 10, rank: 'Corporal', badge: 'bronze' },
  { threshold: 0, rank: 'Private', badge: 'bronze' } // Default, lowest rank
];

const getMilitaryRank = (karmaPoints) => {
  for (let i = 0; i < ranks.length; i++) {
    if (karmaPoints >= ranks[i].threshold) {
      return ranks[i];
    }
  }
  return ranks[ranks.length - 1]; // Default to Private
};
```

### 2. Notification System

#### Database Schema Changes
```sql
-- Create notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL, -- 'post_liked', 'post_disliked', 'comment_added', 'friend_request', 'best_answer'
    title VARCHAR(200) NOT NULL,
    message TEXT,
    related_post_id INTEGER REFERENCES posts(id),
    related_comment_id INTEGER REFERENCES comments(id),
    related_user_id INTEGER REFERENCES users(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_preferences table
CREATE TABLE notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    in_app_notifications BOOLEAN DEFAULT TRUE,
    notification_types JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints
```javascript
// GET /api/notifications
// Get user's notifications
{
  "page": 1,
  "limit": 20,
  "unread_only": false
}

// Response
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "post_liked",
        "title": "Your post was liked",
        "message": "John Doe liked your post 'How to implement React hooks'",
        "related_post_id": 123,
        "related_user": {
          "id": 2,
          "name": "John Doe",
          "image": "url",
          "role": "USER"
        },
        "is_read": false,
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "unread_count": 5,
    "pagination": {...}
  }
}

// POST /api/notifications/mark-read
// Mark notifications as read
{
  "notification_ids": [1, 2, 3] // or "all" for all notifications
}

// PUT /api/notifications/preferences
// Update notification preferences
{
  "email_notifications": true,
  "push_notifications": false,
  "in_app_notifications": true,
  "notification_types": {
    "post_liked": true,
    "post_disliked": false,
    "comment_added": true,
    "friend_request": true,
    "best_answer": true
  }
}

// POST /api/notifications/create
// Create a new notification (internal use)
{
  "user_id": 1,
  "type": "post_liked",
  "title": "Your post was liked",
  "message": "John Doe liked your post",
  "related_post_id": 123,
  "related_user_id": 2
}
```

#### Notification Types
```javascript
const notificationTypes = {
  post_liked: {
    title: "Your post was liked",
    message: "{user} liked your post '{post_title}'"
  },
  post_disliked: {
    title: "Your post received a downvote",
    message: "{user} downvoted your post '{post_title}'"
  },
  comment_added: {
    title: "New comment on your post",
    message: "{user} commented on your post '{post_title}'"
  },
  friend_request: {
    title: "New friend request",
    message: "{user} sent you a friend request"
  },
  best_answer: {
    title: "Best answer marked",
    message: "Your comment was marked as best answer for '{post_title}'"
  },
  karma_milestone: {
    title: "Karma milestone reached",
    message: "Congratulations! You've reached {karma} karma points"
  }
};
```

### 3. Saved Posts System

#### Database Schema Changes
```sql
-- Create saved_posts table
CREATE TABLE saved_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    post_id INTEGER REFERENCES posts(id),
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT, -- Optional user notes
    collection_name VARCHAR(100), -- Optional collection grouping
    UNIQUE(user_id, post_id)
);

-- Create post_collections table
CREATE TABLE post_collections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### API Endpoints
```javascript
// GET /api/saved-posts
// Get user's saved posts
{
  "page": 1,
  "limit": 20,
  "collection": "all" | "collection_name",
  "search": "search_term"
}

// Response
{
  "success": true,
  "data": {
    "saved_posts": [
      {
        "id": 1,
        "post": {
          "id": 123,
          "title": "How to implement React hooks",
          "content": "...",
          "voteCount": 25,
          "bestAnswerId": null,
          "user": {
            "id": 1,
            "name": "John Doe",
            "role": "USER",
            "karmaPoints": 850,
            "expertise": ["React", "JavaScript"]
          },
          "category": {
            "id": 1,
            "name": "React"
          },
          "createdAt": "2024-01-10T..."
        },
        "saved_at": "2024-01-15T10:30:00Z",
        "notes": "Great explanation of useEffect",
        "collection_name": "React Tutorials"
      }
    ],
    "collections": [
      {
        "name": "React Tutorials",
        "count": 5
      },
      {
        "name": "JavaScript Tips",
        "count": 3
      }
    ],
    "pagination": {...}
  }
}

// POST /api/saved-posts
// Save a post
{
  "post_id": 123,
  "notes": "Great explanation of useEffect",
  "collection_name": "React Tutorials"
}

// DELETE /api/saved-posts/:postId
// Remove saved post

// PUT /api/saved-posts/:postId
// Update saved post notes/collection
{
  "notes": "Updated notes",
  "collection_name": "New Collection"
}

// GET /api/saved-posts/collections
// Get user's collections
{
  "success": true,
  "data": {
    "collections": [
      {
        "name": "React Tutorials",
        "description": "Best React tutorials",
        "count": 5,
        "is_public": false,
        "created_at": "2024-01-10T..."
      }
    ]
  }
}

// POST /api/saved-posts/collections
// Create new collection
{
  "name": "React Tutorials",
  "description": "Best React tutorials",
  "is_public": false
}
```

## 🔧 Implementation Requirements

### 1. Real-time Notifications
```javascript
// WebSocket implementation for real-time notifications
const notificationSocket = {
  // Connect to WebSocket server
  connect: (userId) => {
    // Connect to ws://localhost:3001/notifications
    // Send user authentication
  },
  
  // Listen for new notifications
  onNotification: (callback) => {
    // Handle incoming notification
  },
  
  // Mark notification as read
  markAsRead: (notificationId) => {
    // Send mark as read event
  }
};
```

### 2. Karma Points Calculation Service
```javascript
// Service to calculate and update karma points
class KarmaService {
  static async calculateKarma(userId, action, relatedId) {
    const karmaRules = {
      post_created: 10,
      post_upvoted: 2,
      post_downvoted: -1,
      comment_created: 5,
      comment_upvoted: 1,
      comment_downvoted: -1,
      best_answer_marked: 20
    };
    
    const points = karmaRules[action] || 0;
    await this.updateUserKarma(userId, points);
    await this.updateLeaderboard(userId);
  }
  
  static async updateUserKarma(userId, points) {
    // Update user's karma points using existing User model
    await prisma.user.update({
      where: { id: userId },
      data: { karmaPoints: { increment: points } }
    });
  }
  
  static async updateLeaderboard(userId) {
    // Update leaderboard rankings
  }
}

// Integration with existing vote system
const handleVote = async (voteData) => {
  // Create/update vote using existing Vote model
  const vote = await prisma.vote.upsert({
    where: { /* existing vote logic */ },
    update: { value: voteData.value },
    create: voteData
  });
  
  // Calculate karma points
  await KarmaService.calculateKarma(
    voteData.userId, 
    voteData.postId ? 'post_upvoted' : 'comment_upvoted',
    voteData.postId || voteData.commentId
  );
};
```

### 3. Notification Service
```javascript
// Service to create and manage notifications
class NotificationService {
  static async createNotification(data) {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: data.user_id,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedPostId: data.related_post_id,
        relatedCommentId: data.related_comment_id,
        relatedUserId: data.related_user_id
      }
    });
    
    // Send real-time notification via WebSocket
    // Send email notification if enabled
  }
  
  static async markAsRead(userId, notificationIds) {
    // Mark notifications as read
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: userId
      },
      data: { isRead: true }
    });
  }
  
  static async getUnreadCount(userId) {
    // Get count of unread notifications
    return await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });
  }
}
```

## 📊 Database Indexes
```sql
-- Performance indexes for new features
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);
CREATE INDEX idx_saved_posts_collection ON saved_posts(collection_name);

-- Note: karmaPoints index already exists in User model
CREATE INDEX idx_leaderboard_history_user_period ON leaderboard_history(user_id, period_type);
```

## 🔒 Security Considerations
1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Users can only access their own data
3. **Rate Limiting**: Implement rate limiting for notification creation
4. **Input Validation**: Validate all input data
5. **SQL Injection**: Use parameterized queries
6. **XSS Protection**: Sanitize user-generated content

## 📈 Performance Considerations
1. **Caching**: Cache leaderboard data for 5 minutes
2. **Pagination**: Implement proper pagination for large datasets
3. **Database Optimization**: Use appropriate indexes
4. **Real-time Updates**: Use WebSocket for live notifications
5. **Background Jobs**: Use queues for karma calculation

## 🧪 Testing Requirements
1. **Unit Tests**: Test all service functions
2. **Integration Tests**: Test API endpoints
3. **WebSocket Tests**: Test real-time functionality
4. **Performance Tests**: Test with large datasets
5. **Security Tests**: Test authentication and authorization

## 📝 API Documentation
- Use OpenAPI/Swagger for API documentation
- Include request/response examples
- Document error codes and messages
- Provide SDK examples for frontend integration

## 🔄 Integration with Existing System

### Existing Models Integration
- **User Model**: Already has `karmaPoints` field, no changes needed
- **Post Model**: Already has `voteCount` and `bestAnswerId`, integrate with saved posts
- **Comment Model**: Already has `voteCount` and `isBestAnswer`, integrate with notifications
- **Vote Model**: Already exists, integrate karma calculation with vote creation/updates
- **Category Model**: No changes needed

### Existing API Integration
- **Vote Endpoints**: Extend existing `/api/votes` to include karma calculation
- **Post Endpoints**: Extend existing `/api/posts` to include save functionality
- **Comment Endpoints**: Extend existing comment endpoints to include notifications
- **Profile Endpoints**: Extend existing `/api/profile` to include karma and achievements

### Database Migration Strategy
1. **Phase 1**: Add notification tables (no breaking changes)
2. **Phase 2**: Add saved posts tables (no breaking changes)
3. **Phase 3**: Add leaderboard history tables (no breaking changes)
4. **Phase 4**: Add achievement system (no breaking changes)

---

**Last Updated**: [Current Date]
**Next Review**: [Date]
**Status**: Planning Phase 