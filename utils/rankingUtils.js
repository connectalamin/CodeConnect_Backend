// Utility function to calculate user ranking based on karma points
export const calculateRanking = (karmaPoints) => {
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

  return ranks.find(r => karmaPoints >= r.threshold)?.rank || 'Private';
};

// Utility function to calculate comment ranking based on upvotes, downvotes, and creation date
export const calculateCommentRanking = (upvotes, downvotes, createdAt) => {
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / 36e5;
  const score = upvotes - downvotes;
  return score / Math.pow(ageInHours + 2, 1.5);
};
