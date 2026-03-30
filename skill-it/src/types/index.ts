export type SupabaseUser = {
  uid: string
  display_name: string
  email: string
  phone?: string
  last_sign_on?: string
  created_on?: string
}

export type UserProfile = {
  username: string
  verified: boolean
  banned: boolean
  email: string
  profile_picture?: string
  description?: string
  major?: string
  year_of_graduation?: number
  undergrad: boolean
  skills?: Skill[]
  message_threads?: MessageThread[]
}

export type Skill = {
  skill_id: number
  name: string
  explicit: boolean
}

export type Category = {
  category_id: number
  name: string
  explicit: boolean
}

export type Job = {
  job_id: number
  associated_skills?: Skill[]
  category?: Category
  description?: string
  header?: string
  message_threads?: MessageThread[]
  completed: boolean
  posted_by: string
  pending_requests?: string[]
  accepted_workers?: string[]
  title: string
  created_at?: string
}

export type Message = {
  message_id: number
  content: string
  sent_on: string
  sender: string
}

export type MessageThread = {
  thread_id: number
  users: string[]
  job: number
  created_on: string
  thread_name: string
  messages?: Message[]
  archived: boolean
}

export type Review = {
  review_id: number
  from: string
  to: string
  description: string
  rating: number
  associated_job: number
}

export type JobFilters = {
  category?: string
  skills?: string[]
  completed?: boolean
  userId?: string
  search?: string
}
