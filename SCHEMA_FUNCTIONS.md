# Schema Functions Documentation

This document lists all implemented functions (controllers) for each schema model in the CodeConnect application.

## 📝 User Model
**Location:** `server/controllers/auth/userController.js`, `server/controllers/admin/userManageController.js`, `server/controllers/profile/profileController.js`

### Authentication Functions
- `signup` - Register new user with email verification
- `login` - User authentication with JWT token
- `logout` - User logout with token cleanup
- `verifyEmail` - Email verification using token
- `resendVerificationEmail` - Resend verification email
- `forgotPassword` - Request password reset
- `resetPassword` - Reset password using token

### User Management (Admin)
- `getUsers` - Get all users (admin only)
- `deleteUser` - Delete user by ID (admin only)

### Profile Functions
- `getUserProfile` - Get current user's profile
- `updateUserProfile` - Update user profile (with image upload)
- `getPublicUserProfile` - Get public view of user profile
- `uploadMiddleware` - Multer middleware for image upload

## 📂 Category Model
**Location:** `server/controllers/admin/categoryController.js`

### Category Functions (Admin Only)
- `getCategories` - Get all categories
- `createCategory` - Create new category
- `updateCategory` - Update category by ID
- `deleteCategory` - Delete category (cascades to posts)

## 📄 Post Model
**Location:** `server/controllers/post/postController.js`

### Post Functions
- `createPost` - Create new post
- `getAllPosts` - Get all posts with filtering/pagination
- `getPostById` - Get single post with details
- `updatePost` - Update post content/title
- `deletePost` - Delete post (cascades to comments/votes)

## 💬 Comment Model
**Location:** `server/controllers/post/commentController.js`

### Comment Functions
- `createComment` - Create comment on post
- `getCommentsForPost` - Get all comments for a post
- `updateComment` - Update comment content
- `deleteComment` - Delete comment
- `checkBestAnswer` - Mark/unmark comment as best answer

## 👍 Vote Model
**Location:** `server/controllers/post/voteController.js`

### Vote Functions
- `createOrUpdateVote` - Create or update vote (upvote/downvote) for post/comment

## 💾 SavedPost Model
**Location:** `server/controllers/post/savedPostController.js`

### Saved Post Functions
- `savePost` - Save a post to user's saved list
- `unsavePost` - Remove post from saved list
- `getSavedPosts` - Get user's saved posts with pagination
- `checkIfSaved` - Check if post is saved by current user

## 🔔 Notification Model
**Location:** `server/controllers/post/notificationController.js`

### Notification Functions
- `createNotification` - Create notification (internal helper)
- `getUserNotifications` - Get user's notifications with pagination
- `markNotificationAsRead` - Mark single notification as read
- `markAllNotificationsAsRead` - Mark all user notifications as read
- `deleteNotification` - Delete notification

### Notification Preferences
- `getNotificationPreferences` - Get user's notification preferences
- `updateNotificationPreferences` - Update notification settings

## 💭 ChatRoom Model
**Location:** `server/controllers/chatController.js`

### Chat Room Functions
- `getPublicChatRooms` - Get all public chat rooms with filtering
- `createChatRoom` - Create new chat room (admin only)
- `joinChatRoom` - Join a chat room
- `leaveChatRoom` - Leave a chat room
- `getChatRoomDetails` - Get chat room details and members
- `deleteChatRoom` - Delete chat room (admin only)
- `getStatistics` - Get chat statistics for user

## 📨 ChatMessage Model
**Location:** `server/controllers/chatController.js`

### Chat Message Functions
- `getChatRoomMessages` - Get messages for a chat room with pagination

## 👥 ChatRoomMember Model
**Note:** Managed through ChatRoom functions (join/leave operations)

## 🏆 Leaderboard (User Rankings)
**Location:** `server/controllers/leaderboardController.js`

### Leaderboard Functions
- `getLeaderboard` - Get ranked users by karma points
- `getUserPosition` - Get specific user's leaderboard position
- `getLeaderboardByMetric` - Get leaderboard by different metrics
- `getLeaderboardStats` - Get leaderboard statistics

## 🔗 Cross-Model Relationships

### Cascade Operations (ON DELETE CASCADE)
When these entities are deleted, they automatically delete dependent records:

**Category** → Posts → Comments/Votes/SavedPosts/Notifications
**User** → Posts/Comments/Votes/SavedPosts/Notifications/ChatRooms/ChatMessages
**Post** → Comments/Votes/SavedPosts/Notifications
**Comment** → Votes/Notifications
**ChatRoom** → ChatRoomMembers/ChatMessages

### Best Answer System
- Posts can have one `bestAnswerId` pointing to a Comment
- Comments track `isBestAnswer` boolean
- Managed through `checkBestAnswer` function

### Vote System
- Votes can be for Posts OR Comments (nullable foreign keys)
- Single vote per user per post/comment (enforced by unique constraints)
- Vote counts cached on Post/Comment models

### Notification System
- Triggered by: new comments, votes, best answers
- Links to Posts, Comments, and Users
- User preferences control delivery methods

## 📊 Data Access Patterns

### Authentication Required
- Most operations require `authMiddleware`
- Admin operations require `adminMiddleware`
- User context available via `req.userId` and `req.user`

### Pagination Support
- Posts: `getAllPosts`
- Comments: `getCommentsForPost`
- Saved Posts: `getSavedPosts`
- Notifications: `getUserNotifications`
- Chat Messages: `getChatRoomMessages`

### Search & Filtering
- Posts: by category, search terms, user
- Chat Rooms: by category, search terms
- Users: by various criteria (admin)

## 🔐 Permission Levels

### Public Access
- View posts and comments (read-only)
- User registration/login

### Authenticated Users
- Create/edit/delete own posts and comments
- Vote on content
- Save posts
- Join chat rooms
- Manage notifications

### Admin Users
- All user permissions
- Manage categories (CRUD)
- Manage chat rooms
- Delete any content
- View all users

---
*Generated from codebase analysis on 2025-08-12*
