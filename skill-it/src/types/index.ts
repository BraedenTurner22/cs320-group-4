export type SupabaseUser = {
  uid: string
  display_name: string
  email: string
  phone?: string
  last_sign_on?: string
  created_on?: string
}

export type UserProfile = {
  id: number
  auth_uid: string
  created_at?: string
  Username: string
  Banned?: boolean
  Email: string
  Description?: string
  Major?: string
  Graduation_Year?: number
  Is_Undergrad?: boolean
}

export type Skill = {
  id: number
  name: string
  explicit: boolean
}

export type Category = {
  id: number
  name: string
  explicit: boolean
}

export type Job = {
  id: number
  title: string
  created_at?: string
  posted_by: number
  description?: string
  completed: boolean
  pending_requests?: number[]
  accepted_workers?: number[]
  // Joined relations (not direct columns)
  associated_skills?: Skill[]
  category?: Category
}

export type Message = {
  MessageId: number
  sent_on: string
  Content: string
  Sender: number
  message_thread: number
}

export type MessageThread = {
  id: number
  created_on: string
  job: number
  'Thread name': string
  Archived: boolean
}

export type JobFilters = {
  category?: string
  skills?: string[]
  completed?: boolean
  userId?: number
  search?: string
}
