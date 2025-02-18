import prisma from "../../DB/db.config.js";

// Create a comment
export const createComment = async (req, res) => {
    try {
      const userId = req.userId; 
      const { content } = req.body;
      const postId = parseInt(req.params.id);
  
      if (!userId) {
        return res.status(400).json({ error: "User ID not found in request." });
      }
  
      // Create the comment with the correct relations
      const comment = await prisma.comment.create({
        data: {
          content,
          userId: userId,
          postId: postId,
        },
      });
  
      res.status(201).json({ message: "Comment created successfully", comment });
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Something went wrong", details: error.message });
    }
  };