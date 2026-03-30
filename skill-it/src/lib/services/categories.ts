import type { Category } from '@/types'

export const category = {
  async create(_name: string, _explicit: boolean): Promise<Category> {
    // TODO
    throw new Error('not implemented')
  },

  async getAll(): Promise<Category[]> {
    // TODO
    throw new Error('not implemented')
  },

  async getByID(_categoryId: number): Promise<Category> {
    // TODO
    throw new Error('not implemented')
  },

  async update(_categoryId: number, _fields: Partial<Category>): Promise<Category> {
    // TODO
    throw new Error('not implemented')
  },

  async delete(_categoryId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },
}

export const categoryHolder = {
  async setCategoryForJob(_jobId: number, _categoryId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },

  async getCategoryForJob(_jobId: number): Promise<Category> {
    // TODO
    throw new Error('not implemented')
  },

  async removeCategoryFromJob(_jobId: number): Promise<boolean> {
    // TODO
    throw new Error('not implemented')
  },
}
