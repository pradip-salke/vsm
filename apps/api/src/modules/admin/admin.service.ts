import { adminRepository } from './admin.repository.js';

export const adminService = {
  getDashboard: () => adminRepository.dashboard(),
  createPage: (input: Parameters<typeof adminRepository.createPage>[0]) => adminRepository.createPage(input),
  listPages: (input: { limit: number; cursor?: number }) => adminRepository.listPages(input),
};
