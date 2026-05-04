import { createClient } from '@/lib/supabase/server'
import type { MappedReview, Review } from '@/types'
import { createAdminClient } from '../supabase/admin'

export const reviews = {
  async createReview(
    _author: number,
    _subjects: number[],
    _feedback: string,
    _rating: number,
    _jobid: number
  ): Promise<{ reviewId: number }> {
    const supabase = await createClient()

    let lastReviewId = 0

    // For each subject, create a separate review row and link it
    for (const subject of _subjects) {
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
      lastReviewId = reviewId

      // Insert into review-author-subject junction for this subject
      const { error: authorSubjectError } = await supabase
        .from('Reviews-Author-Subject-Job')
        .insert({
          Review: reviewId,
          Author: _author,
          Subject: subject,
          Job: _jobid
        })

      if (authorSubjectError) {
        throw new Error(`Failed to link review author and subject: ${authorSubjectError.message}`)
      }
    }

    return { reviewId: lastReviewId }
  },

  async getReviewByJobID(jobId: number, profileId: number): Promise<Review[]> {
    const supabase = await createClient()

    // Get the review id from the junction table
    const { data: junctionData, error: junctionError } = await supabase
      .from('Reviews-Author-Subject-Job')
      .select('Review, Subject')
      .eq('Job', jobId)
      .eq('Author', profileId)

    // console.log(junctionData)
    if (junctionError || !junctionData) {
      return []
    }

    const reviewIds = junctionData.map((d) => d.Review)
    //console.log(reviewIds)
    // Get the review details from the Reviews table
    const { data: reviewData, error: reviewError } = await supabase
      .from('Reviews')
      .select('*')
      .in('id', reviewIds )

    if (reviewError || reviewData.length === 0) {
      return []
    }
    //console.log(reviewData)

    // Create and return the Review object
    const listOfReviews = reviewData.map((d)=>{
      
      const review: Review = {
      id: d.id,
      author: profileId,
      subject: junctionData.filter((json)=>json.Review === d.id)[0].Subject,
      rating: d.Rating,
      feedback: d.Feedback,
      jobid: jobId
    }
    return review
    })

    // return review
    return listOfReviews
  },

  async getReviewsAboutSubject(subjectId: number): Promise<MappedReview[]>{
    const supabase = createAdminClient()
    
    const { data: links, error } = await supabase
      .from('Reviews-Author-Subject-Job')
      .select('Review, Author')
      .eq('Subject', subjectId)
      
    if (error || !links || links.length === 0) return []
    
    const reviewIds = links.map(l => l.Review)
    const authorIds = [...new Set(links.map(l => l.Author))]
    

    const { data: reviewsData } = await supabase.from('Reviews').select('*').in('id', reviewIds)
    const { data: authorsData } = await supabase.from('Profile').select('id, Username').in('id', authorIds)
    

    return links.map(link => {
      const review = reviewsData?.find(r => r.id === link.Review)
      const author = authorsData?.find(a => a.id === link.Author)
      return {
        id: review?.id || 0,
        rating: review?.Rating || 5,
        text: review?.Feedback || '',
        authorName: author?.Username || 'Anonymous'
      }
    }).filter(r => r.text !== '')
  }
}
