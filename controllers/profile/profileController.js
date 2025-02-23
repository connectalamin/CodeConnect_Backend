import prisma from '../../DB/db.config.js';
import cloudinary from  '../../utils/cloudinary.config.js';
import upload from '../../utils/multer.config.js';

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        posts: true,
        comments: true,
        votes: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate karma points
    const upvotesOnPosts = user.posts.reduce((sum, post) => sum + post.voteCount, 0);
    const upvotesOnComments = user.comments.reduce((sum, comment) => sum + comment.voteCount, 0);
    const downvotesOnPosts = user.votes.filter(vote => vote.postId && vote.value === -1).length;
    const downvotesOnComments = user.votes.filter(vote => vote.commentId && vote.value === -1).length;
    const bestAnswers = user.comments.filter(comment => comment.isBestAnswer).length;

    console.log('Upvotes on Posts:', upvotesOnPosts);
    console.log('Upvotes on Comments:', upvotesOnComments);
    console.log('Downvotes on Posts:', downvotesOnPosts);
    console.log('Downvotes on Comments:', downvotesOnComments);
    console.log('Best Answers:', bestAnswers);

    const karmaPoints = upvotesOnPosts + upvotesOnComments - downvotesOnPosts - downvotesOnComments + (bestAnswers * 10);

    await prisma.user.update({
        where: { id: userId },
        data: { karmaPoints }
      });


    const ranks = [
      { threshold: 50000, rank: 'Field Marshal' },
      { threshold: 25000, rank: 'Marshal' },
      { threshold: 10000, rank: 'General' },
      { threshold: 6000, rank: 'Lieutenant General' },
      { threshold: 4000, rank: 'Major General' },
      { threshold: 2500, rank: 'Brigadier General' },
      { threshold: 1500, rank: 'Colonel' },
      { threshold: 1000, rank: 'Lieutenant Colonel' },
      { threshold: 700, rank: 'Major' },
      { threshold: 400, rank: 'Captain' },
      { threshold: 200, rank: 'Lieutenant' },
      { threshold: 50, rank: 'Sergeant' },
      { threshold: 20, rank: 'Corporal' },
      { threshold: 0, rank: 'Private' } // Default, lowest rank
    ];

    // Determine ranking based on karma points
    let ranking = ranks.find(r => karmaPoints >= r.threshold)?.rank|| 'Private';

    const userProfile = {
      ...user,
      karmaPoints,
      ranking,
      timeJoined: calculateTimeAgo(user.createdAt)
    };

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error); // Log the error details
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('req.body:', req.body); // Debug full body
    const { name, classId, session, batch, dept, university, occupation, expertise } = req.body;

    console.log('Raw expertise from req.body:', expertise); // Debug raw value

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in request.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let imageUrl = user.image;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: 'image',
              public_id: `user_${userId}_profile`,
              width: 500,
              height: 500,
              crop: 'fit',
              fetch_format: 'auto',
              quality: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }

    // Safely parse expertise
    let parsedExpertise = [];
    if (expertise) {
      try {
        parsedExpertise = JSON.parse(expertise);
        if (!Array.isArray(parsedExpertise)) {
          parsedExpertise = [];
        }
      } catch (error) {
        console.error('Failed to parse expertise:', error);
        parsedExpertise = [];
      }
    }
    console.log('Parsed expertise:', parsedExpertise); // Debug parsed value

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name || user.name,
        image: imageUrl,
        classId,
        session,
        batch,
        dept,
        university,
        occupation,
        expertise: parsedExpertise, // Use parsed value
      },
    });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
};

export const uploadMiddleware = upload.single('image');

const calculateTimeAgo = (createdAt) => {
    const now = new Date();
    const diffMs = now - new Date(createdAt);
    const units = [
      { name: 'year', ms: 31536000000 }, // 1 year in milliseconds
      { name: 'month', ms: 2628000000 },  // Approx 1 month in milliseconds
      { name: 'day', ms: 86400000 },
      { name: 'hour', ms: 3600000 },
      { name: 'minute', ms: 60000 },
      { name: 'second', ms: 1000 }
    ];
  
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      const count = Math.floor(diffMs / unit.ms);
      if (count >= 1) {
        return `${count} ${unit.name}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'just now';
  };