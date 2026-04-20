import { reviews } from '@/lib/services/reviews'

describe('Reviews', () => {
  it('createReview → not implemented until Review table exists', async () => {
    await expect(reviews.createReview(2, 'Hello World', 3, 4)).rejects.toThrow(/not implemented/i)
  })

  it('retrieveAuthor(1) → not implemented', async () => {
    await expect(reviews.retrieveAuthor(1)).rejects.toThrow(/not implemented/i)
  })

  it('retrieveAuthor(2) → error', async () => {
    await expect(reviews.retrieveAuthor(2)).rejects.toThrow(/not implemented/i)
  })

  it('retrieveSubject(2) → not implemented', async () => {
    await expect(reviews.retrieveSubject(2)).rejects.toThrow(/not implemented/i)
  })

  it('retrieveSubject(3) → error', async () => {
    await expect(reviews.retrieveSubject(3)).rejects.toThrow(/not implemented/i)
  })

  it('retrieveSubjectAboveRating → not implemented', async () => {
    await expect(reviews.retrieveSubjectAboveRating(3)).rejects.toThrow(/not implemented/i)
  })

  it('retrieveJob(1) → not implemented', async () => {
    await expect(reviews.retrieveJob(1)).rejects.toThrow(/not implemented/i)
  })
})
