import type { UserProfile, Skill, Review, MessageThread } from '@/types'

export const profile = {
  async create(_data: Partial<UserProfile>): Promise<UserProfile> {
    // TODO
    throw new Error('not implemented')
  },

  async getCurrent(): Promise<UserProfile> {
    // TODO
    throw new Error('not implemented')
  },

  async getByUID(_uid: string): Promise<UserProfile> {
    // TODO
    throw new Error('not implemented')
  },

  async update(_uid: string, _fields: Partial<UserProfile>): Promise<UserProfile> {
    // TODO
    throw new Error('not implemented')
  },

  async delete(_uid: string): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async verify(_uid: string): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async ban(_uid: string): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async unban(_uid: string): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async addSkill(_uid: string, _skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async removeSkill(_uid: string, _skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async getSkills(_uid: string): Promise<Skill[]> {
    // TODO
    throw new Error('not implemented')
  },

  async getReviewsReceived(_uid: string): Promise<Review[]> {
    // TODO
    throw new Error('not implemented')
  },

  async getReviewsGiven(_uid: string): Promise<Review[]> {
    // TODO
    throw new Error('not implemented')
  },

  async getThreads(_uid: string): Promise<MessageThread[]> {
    // TODO
    throw new Error('not implemented')
  },
}
