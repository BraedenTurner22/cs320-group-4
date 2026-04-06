import type { UserProfile, Job } from '@/types'

// NOTE: No "Review" table exists in the current Supabase schema.
// These methods are placeholders for when a Review table is added.

export const reviews = {
  async createReview(
    _to: number,
    _description: string,
    _rating: number,
    _associatedJob: number
  ): Promise<unknown> {
    // TODO: No Review table in schema yet
    throw new Error('not implemented')
  },

  async retrieveAuthor(_reviewId: number): Promise<UserProfile> {
    // TODO: No Review table in schema yet
    throw new Error('not implemented')
  },

  async retrieveSubject(_reviewId: number): Promise<UserProfile> {
    // TODO: No Review table in schema yet
    throw new Error('not implemented')
  },

  async retrieveSubjectAboveRating(_rating: number): Promise<unknown[]> {
    // TODO: No Review table in schema yet
    throw new Error('not implemented')
  },

  async retrieveJob(_reviewId: number): Promise<Job> {
    // TODO: No Review table in schema yet
    throw new Error('not implemented')
  },
}
