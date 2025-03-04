// Utility function to calculate user ranking based on karma points
export const calculateRanking = (karmaPoints) => {
  const ranks = [
    { threshold: 25000, rank: 'Field Marshal' },
    { threshold: 10000, rank: 'Marshal' },
    { threshold: 70000, rank: 'General' },
    { threshold: 5000, rank: 'Lieutenant General' },
    { threshold: 3000, rank: 'Major General' },
    { threshold: 2000, rank: 'Brigadier General' },
    { threshold: 1300, rank: 'Colonel' },
    { threshold: 800, rank: 'Lieutenant Colonel' },
    { threshold: 400, rank: 'Major' },
    { threshold: 200, rank: 'Captain' },
    { threshold: 100, rank: 'Lieutenant' },
    { threshold: 50, rank: 'Sergeant' },
    { threshold: 10, rank: 'Corporal' },
    { threshold: 0, rank: 'Private' } // Default, lowest rank
  ];

  return ranks.find(r => karmaPoints >= r.threshold)?.rank || 'Private';
};

// Utility function to calculate comment ranking based on upvotes, downvotes, and creation date
export const calculateCommentRanking = (upvotes, downvotes, createdAt) => {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  const score = upvotes - downvotes;
  return score / Math.pow(ageInHours + 2, 1.5);
};
