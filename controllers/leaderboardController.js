import { calculateRanking } from '../utils/rankingUtils.js';

// Get top users by karma points
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50, offset = 0, timeframe = 'all' } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    // Build where clause based on timeframe
    let whereClause = {};
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        whereClause.createdAt = {
          gte: startDate
        };
      }
    }

    const users = await req.prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        image: true,
        karmaPoints: true,
        createdAt: true,
        dept: true,
        university: true,
        occupation: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true
          }
        },
        posts: {
          select: {
            bestAnswerId: true,
            _count: {
              select: {
                comments: true
              }
            }
          }
        }
      },
      orderBy: {
        karmaPoints: 'desc'
      },
      take: limitNum,
      skip: offsetNum
    });

    // Calculate additional metrics for each user
    const leaderboardData = users.map((user, index) => {
      const bestAnswers = user.posts.filter(post => post.bestAnswerId !== null).length;
      const totalPostComments = user.posts.reduce((sum, post) => sum + post._count.comments, 0);
      
      return {
        position: offsetNum + index + 1,
        id: user.id,
        name: user.name,
        image: user.image,
        karmaPoints: user.karmaPoints,
        rank: calculateRanking(user.karmaPoints),
        dept: user.dept,
        university: user.university,
        occupation: user.occupation,
        joinedAt: user.createdAt,
        stats: {
          posts: user._count.posts,
          comments: user._count.comments,
          votes: user._count.votes,
          bestAnswers: bestAnswers,
          totalPostComments: totalPostComments
        }
      };
    });

    // Get total count for pagination
    const totalUsers = await req.prisma.user.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardData,
        pagination: {
          total: totalUsers,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalUsers
        }
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
};

// Get user's position in leaderboard
export const getUserPosition = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId);

    if (!userIdNum) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Get user's karma points
    const user = await req.prisma.user.findUnique({
      where: { id: userIdNum },
      select: {
        id: true,
        name: true,
        image: true,
        karmaPoints: true,
        createdAt: true,
        dept: true,
        university: true,
        occupation: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true
          }
        },
        posts: {
          select: {
            bestAnswerId: true,
            _count: {
              select: {
                comments: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's position (count users with higher karma points)
    const position = await req.prisma.user.count({
      where: {
        karmaPoints: {
          gt: user.karmaPoints
        }
      }
    }) + 1;

    // Calculate additional metrics
    const bestAnswers = user.posts.filter(post => post.bestAnswerId !== null).length;
    const totalPostComments = user.posts.reduce((sum, post) => sum + post._count.comments, 0);

    const userData = {
      position,
      id: user.id,
      name: user.name,
      image: user.image,
      karmaPoints: user.karmaPoints,
      rank: calculateRanking(user.karmaPoints),
      dept: user.dept,
      university: user.university,
      occupation: user.occupation,
      joinedAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        comments: user._count.comments,
        votes: user._count.votes,
        bestAnswers: bestAnswers,
        totalPostComments: totalPostComments
      }
    };

    res.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('Error fetching user position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user position',
      error: error.message
    });
  }
};

// Get leaderboard by specific metric
export const getLeaderboardByMetric = async (req, res) => {
  try {
    const { metric = 'karma', limit = 20, offset = 0 } = req.query;
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);

    let orderBy = {};
    let includeFields = {
      id: true,
      name: true,
      image: true,
      karmaPoints: true,
      createdAt: true,
      dept: true,
      university: true,
      occupation: true
    };

    // Define ordering based on metric
    switch (metric) {
      case 'posts':
        // We'll need to use aggregation for this
        break;
      case 'comments':
        // We'll need to use aggregation for this  
        break;
      case 'karma':
      default:
        orderBy = { karmaPoints: 'desc' };
        break;
    }

    if (metric === 'posts' || metric === 'comments') {
      // For posts and comments, we need to use raw query or aggregation
      const users = await req.prisma.user.findMany({
        select: {
          ...includeFields,
          _count: {
            select: {
              posts: true,
              comments: true,
              votes: true
            }
          },
          posts: {
            select: {
              bestAnswerId: true
            }
          }
        },
        take: limitNum * 3, // Get more to sort properly
        skip: offsetNum
      });

      // Sort by the requested metric
      const sortedUsers = users.sort((a, b) => {
        if (metric === 'posts') {
          return b._count.posts - a._count.posts;
        } else if (metric === 'comments') {
          return b._count.comments - a._count.comments;
        }
        return 0;
      }).slice(0, limitNum);

      const leaderboardData = sortedUsers.map((user, index) => {
        const bestAnswers = user.posts.filter(post => post.bestAnswerId !== null).length;
        
        return {
          position: offsetNum + index + 1,
          id: user.id,
          name: user.name,
          image: user.image,
          karmaPoints: user.karmaPoints,
          rank: calculateRanking(user.karmaPoints),
          dept: user.dept,
          university: user.university,
          occupation: user.occupation,
          joinedAt: user.createdAt,
          stats: {
            posts: user._count.posts,
            comments: user._count.comments,
            votes: user._count.votes,
            bestAnswers: bestAnswers
          },
          primaryMetric: metric === 'posts' ? user._count.posts : user._count.comments
        };
      });

      return res.json({
        success: true,
        data: {
          leaderboard: leaderboardData,
          metric,
          pagination: {
            limit: limitNum,
            offset: offsetNum
          }
        }
      });
    }

    // For karma (default case)
    const users = await req.prisma.user.findMany({
      where: {},
      select: {
        ...includeFields,
        _count: {
          select: {
            posts: true,
            comments: true,
            votes: true
          }
        },
        posts: {
          select: {
            bestAnswerId: true
          }
        }
      },
      orderBy,
      take: limitNum,
      skip: offsetNum
    });

    const leaderboardData = users.map((user, index) => {
      const bestAnswers = user.posts.filter(post => post.bestAnswerId !== null).length;
      
      return {
        position: offsetNum + index + 1,
        id: user.id,
        name: user.name,
        image: user.image,
        karmaPoints: user.karmaPoints,
        rank: calculateRanking(user.karmaPoints),
        dept: user.dept,
        university: user.university,
        occupation: user.occupation,
        joinedAt: user.createdAt,
        stats: {
          posts: user._count.posts,
          comments: user._count.comments,
          votes: user._count.votes,
          bestAnswers: bestAnswers
        },
        primaryMetric: user.karmaPoints
      };
    });

    res.json({
      success: true,
      data: {
        leaderboard: leaderboardData,
        metric,
        pagination: {
          limit: limitNum,
          offset: offsetNum
        }
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard by metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard by metric',
      error: error.message
    });
  }
};

// Get leaderboard stats (summary information)
export const getLeaderboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await req.prisma.user.count();

    // Get user distribution by rank
    const users = await req.prisma.user.findMany({
      select: {
        karmaPoints: true
      }
    });

    const rankDistribution = users.reduce((acc, user) => {
      const rank = calculateRanking(user.karmaPoints);
      acc[rank] = (acc[rank] || 0) + 1;
      return acc;
    }, {});

    // Get top performer stats
    const topUser = await req.prisma.user.findFirst({
      orderBy: {
        karmaPoints: 'desc'
      },
      select: {
        id: true,
        name: true,
        karmaPoints: true,
        image: true
      }
    });

    // Calculate average karma
    const avgKarma = users.reduce((sum, user) => sum + user.karmaPoints, 0) / users.length;

    res.json({
      success: true,
      data: {
        totalUsers,
        averageKarma: Math.round(avgKarma),
        topPerformer: {
          ...topUser,
          rank: topUser ? calculateRanking(topUser.karmaPoints) : null
        },
        rankDistribution
      }
    });

  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard stats',
      error: error.message
    });
  }
};
