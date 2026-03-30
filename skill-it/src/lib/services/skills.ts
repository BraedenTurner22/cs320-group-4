import type { Skill } from '@/types'

export const skill = {
  async create(_name: string, _explicit: boolean): Promise<Skill> {
    // TODO
    throw new Error('not implemented')
  },

  async getAll(): Promise<Skill[]> {
    // TODO
    throw new Error('not implemented')
  },

  async getByID(_skillId: number): Promise<Skill> {
    // TODO
    throw new Error('not implemented')
  },

  async update(_skillId: number, _fields: Partial<Skill>): Promise<Skill> {
    // TODO
    throw new Error('not implemented')
  },

  async delete(_skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },
}

export const pskillHolder = {
  async addSkillToProfile(_uid: string, _skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async removeSkillFromProfile(_uid: string, _skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async getSkillsForProfile(_uid: string): Promise<Skill[]> {
    // TODO
    throw new Error('not implemented')
  },
}

export const jskillHolder = {
  async addSkillToJob(_jobId: number, _skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async removeSkillFromJob(_jobId: number, _skillId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async getSkillsForJob(_jobId: number): Promise<Skill[]> {
    // TODO
    throw new Error('not implemented')
  },
}
