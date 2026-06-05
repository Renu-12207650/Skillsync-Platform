import { describe, it, expect } from 'vitest';
import { scoreMentor, rankMentors, overlapCount } from './matching.js';

const ALICE = { id: 1, skillIds: [10, 20, 30], yearsOfExperience: 8, status: 'ACTIVE', averageRating: 4.5 };
const BOB   = { id: 2, skillIds: [40],         yearsOfExperience: 2, status: 'ACTIVE', averageRating: 0   };
const CARO  = { id: 3, skillIds: [10, 20],     yearsOfExperience: 12, status: 'PENDING_APPROVAL', averageRating: 0 };

describe('matching::scoreMentor', () => {
  it('rewards skill overlap above experience', () => {
    const interests = [10, 20];
    expect(scoreMentor(ALICE, interests)).toBeGreaterThan(scoreMentor(BOB, interests));
  });

  it('falls back to experience when no interests', () => {
    expect(scoreMentor(CARO, [])).toBeGreaterThan(scoreMentor(BOB, []));
  });

  it('boosts ACTIVE mentors over PENDING_APPROVAL', () => {
    const a = { ...ALICE, status: 'ACTIVE' };
    const b = { ...ALICE, id: 99, status: 'PENDING_APPROVAL' };
    expect(scoreMentor(a, [10])).toBeGreaterThan(scoreMentor(b, [10]));
  });

  it('returns 0 for null mentor', () => {
    expect(scoreMentor(null, [1])).toBe(0);
  });
});

describe('matching::rankMentors', () => {
  it('sorts by descending score', () => {
    const ranked = rankMentors([BOB, ALICE, CARO], [10, 20]);
    expect(ranked[0].id).toBe(ALICE.id);
  });

  it('respects the limit argument', () => {
    const ranked = rankMentors([ALICE, BOB, CARO], [10], 2);
    expect(ranked).toHaveLength(2);
  });

  it('handles empty input gracefully', () => {
    expect(rankMentors([], [1])).toEqual([]);
    expect(rankMentors(null, [1])).toEqual([]);
  });
});

describe('matching::overlapCount', () => {
  it('counts overlapping skill ids', () => {
    expect(overlapCount(ALICE, [10, 20, 99])).toBe(2);
  });
  it('returns 0 when there is no overlap', () => {
    expect(overlapCount(BOB, [10, 20])).toBe(0);
  });
  it('returns 0 for missing data', () => {
    expect(overlapCount(null, [1])).toBe(0);
    expect(overlapCount({}, [1])).toBe(0);
  });
});
