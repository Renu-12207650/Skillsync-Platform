/**
 * Skill-based mentor recommendation logic.
 * The backend doesn't yet know about a learner's skill interests, so we score
 * mentors locally:
 *
 *   score = overlap(mentor.skillIds, learner.interests) * 10
 *         + Math.min(yearsOfExperience, 10) * 0.5
 *         + statusBoost (ACTIVE = +2, PENDING = 0)
 *
 * If the learner has no interests, mentors are ranked by experience and
 * (if available) average rating only.
 */

const STATUS_BOOSTS = { ACTIVE: 2, PENDING_APPROVAL: 0, REJECTED: -10 };

export function scoreMentor(mentor, interests = []) {
  if (!mentor) return 0;
  const skillIds = Array.isArray(mentor.skillIds) ? mentor.skillIds : [];
  const overlap = interests.length === 0
    ? 0
    : skillIds.filter((id) => interests.includes(id)).length;

  const exp = Math.min(mentor.yearsOfExperience ?? 0, 10) * 0.5;
  const statusBoost = STATUS_BOOSTS[mentor.status] ?? 0;
  const rating = Number(mentor.averageRating ?? 0) * 0.4;

  return overlap * 10 + exp + statusBoost + rating;
}

export function rankMentors(mentors, interests = [], limit = 0) {
  const ranked = [...(mentors || [])]
    .map((m) => ({ ...m, _score: scoreMentor(m, interests) }))
    .sort((a, b) => b._score - a._score);
  return limit ? ranked.slice(0, limit) : ranked;
}

/** Number of overlapping skills — useful as a UI badge. */
export function overlapCount(mentor, interests = []) {
  if (!mentor || !Array.isArray(mentor.skillIds)) return 0;
  return mentor.skillIds.filter((id) => interests.includes(id)).length;
}
