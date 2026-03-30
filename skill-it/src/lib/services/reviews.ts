import type { Review, UserProfile, Job } from '@/types'

export const reviews = {
  async createReview(
    _to: string,
    _description: string,
    _rating: number,
    _associatedJob: number
  ): Promise<Review> {
    // TODO
    throw new Error('not implemented')
  },

  async retrieveAuthor(_reviewId: number): Promise<UserProfile> {
    // TODO
    throw new Error('not implemented')
  },

  async retrieveSubject(_reviewId: number): Promise<UserProfile> {
    // TODO
    throw new Error('not implemented')
  },

  async retrieveSubjectAboveRating(_rating: number): Promise<Review[]> {
    // TODO
    throw new Error('not implemented')
  },

  async retrieveJob(_reviewId: number): Promise<Job> {
    // TODO
    throw new Error('not implemented')
  },
}
