# Schema Changelog

## Migration: 20250311145322_add_category_cascade
Date Applied: 2025-03-11

### Summary
Replaced the existing foreign key constraint on `Post.categoryId` to include **ON DELETE CASCADE ON UPDATE CASCADE**. This causes all `Post` records (and their dependent entities) to be automatically removed when a `Category` is deleted.

### Previous Behavior
- `Post.categoryId` FK used the default delete action (RESTRICT / NO ACTION depending on provider), preventing deletion of a `Category` while Posts referenced it.

### New Behavior
- Deleting a `Category` automatically deletes:
  - Its `Posts`
  - The `Comments` of those posts
  - The `Votes` for those posts and their comments
  - The `SavedPost` entries referencing those posts
  - The `Notifications` referencing those posts or their comments

### Migration SQL
```sql
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- AddForeignKey (with cascade)
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### Entities (Current Snapshot)
| Entity | Core Fields (abridged) | Notes |
|--------|------------------------|-------|
| User | id, email, role, karmaPoints | Parent to most content |
| Category | id, name | Now cascades into Posts |
| Post | id, title, content, categoryId, userId, bestAnswerId? | Cascades to Comments, Votes, SavedPosts, Notifications |
| Comment | id, content, postId, userId | Cascades to Votes, Notifications |
| Vote | id, value, (postId | commentId), userId | Child of Post or Comment |
| SavedPost | id, userId, postId | Junction, cascades from Post & User |
| Notification | id, userId, relatedPostId?, relatedCommentId?, relatedUserId? | Multiple FK paths |
| NotificationPreference | id, userId | One-to-one with User |
| ChatRoom | id, name, createdById | Cascades to ChatRoomMember & ChatMessage |
| ChatRoomMember | id, userId, chatRoomId | Unique composite (user, chatRoom) |
| ChatMessage | id, content, chatRoomId, userId | Child of ChatRoom & User |

### Relationship & Cascade Overview
Parent → Child (Delete Action):
- **Category → Post (CASCADE)** ← updated in this migration
- Post → Comment (CASCADE)
- Post → Vote (CASCADE)
- Post → SavedPost (CASCADE)
- Post → Notification (CASCADE)
- Comment → Vote (CASCADE)
- Comment → Notification (CASCADE)
- User → (Post, Comment, Vote, SavedPost, Notification, NotificationPreference, ChatRoom, ChatRoomMember, ChatMessage) (CASCADE)
- ChatRoom → (ChatRoomMember, ChatMessage) (CASCADE)

### Deletion Chain Example
Deleting Category X triggers:
1. Delete Posts in Category X.
2. For each Post:
   - Delete Comments
   - Delete Votes (post-level)
   - Delete SavedPost entries
   - Delete Notifications (post-level)
3. For each Comment deleted:
   - Delete Votes (comment-level)
   - Delete Notifications (comment-level)

### Impact on Diagrams
- **ER Diagram:** Mark `Category (1) ──< (∞) Post` with `(cascade)`.
- **Class Diagram:** Add annotation / stereotype `<<cascade>>` on Post.category association.
- **Sequence (Admin Category Deletion):** Remove explicit loop of deleting posts; now single DB command + cascade.
- **DFD:** Collapse multiple delete operations into one cascade delete process bubble.

### Risks / Considerations
| Area | Concern | Mitigation |
|------|---------|-----------|
| Data Loss | Large unintended deletion | Add admin confirmation with post & comment counts |
| Performance | Big cascade may lock rows | Pre-count & warn; schedule off-peak for huge categories |
| Auditing | Hard to trace deletion scope | Add optional audit log (future) |

### Recommended Admin Pre-Delete Summary Query
```sql
SELECT
  c.id,
  COUNT(p.id) AS post_count,
  COALESCE(SUM(pc.comment_count),0) AS comment_count
FROM Category c
LEFT JOIN Post p ON p.categoryId = c.id
LEFT JOIN (
  SELECT postId, COUNT(*) AS comment_count
  FROM Comment
  GROUP BY postId
) pc ON pc.postId = p.id
WHERE c.id = $1
GROUP BY c.id;
```

### Rollback (Manual)
```sql
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

### Future Enhancements
- Soft delete for Category (`isArchived` flag) with deferred purge.
- Audit log table capturing cascaded entity counts.
- Guardrail: block deletion if post_count > threshold unless `force=true`.

### Changelog Version
- Schema state corresponds to Prisma model in `schema.prisma` at commit including migration `20250311145322_add_category_cascade`.

---
Generated for internal documentation & diagram updates.
