import { createClient } from '@/lib/supabase/server'
import type { Review } from '@/types'

export const reviews = {
  async createReview(
    _author: number,
    _subjects: number[],
    _feedback: string,
    _rating: number,
    _jobid: number
  ): Promise<{ reviewId: number }> {
    const supabase = await createClient()

    // Insert into reviews table
    const { data: reviewData, error: reviewError } = await supabase
      .from('Reviews')
      .insert({ Feedback: _feedback, Rating: _rating })
      .select('id')
      .single()

    if (reviewError) {
      throw new Error(`Failed to create review: ${reviewError.message}`)
    }

    const reviewId = reviewData.id

    // Insert into review-author-subject junction for each subject
    const inserts = _subjects.map(subject => ({
      Review: reviewId,
      Author: _author,
      Subject: subject,
      Job: _jobid
    }))

    const { error: authorSubjectError } = await supabase
      .from('Reviews-Author-Subject-Job')
      .insert(inserts)

    if (authorSubjectError) {
      throw new Error(`Failed to link review author and subjects: ${authorSubjectError.message}`)
    }

    return { reviewId }
  },

  async getReviewByJobID(jobId: number, profileId: number): Promise<Review | null> {
    const supabase = await createClient()

    // Get the review id from the junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('Reviews-Author-Subject-Job')
      .select('Review')
      .eq('Job', jobId)
      .eq('Author', profileId)
      .single()

    // console.log(junctionData  )
    if (junctionError || !junctionData) {
      return null
    }

    const reviewId = junctionData.Review

    // Get the review details from the Reviews table
    const { data: reviewData, error: reviewError } = await supabase
      .from('Reviews')
      .select('*')
      .eq('id', reviewId)
      .single()

    if (reviewError || !reviewData) {
      return null
    }

    // Get all subjects for this review
    const { data: subjectsData, error: subjectsError } = await supabase
      .from('Reviews-Author-Subject-Job')
      .select('Subject')
      .eq('Review', reviewId)

    if (subjectsError) {
      throw new Error(`Failed to get subjects: ${subjectsError.message}`)
    }

    const subjects = subjectsData.map(s => s.Subject)

    // Create and return the Review object
    const review: Review = {
      id: reviewData.id,
      author: profileId,
      subject: subjects,
      rating: reviewData.Rating,
      feedback: reviewData.Feedback,
      jobid: jobId
    }

    return review
  }
}
