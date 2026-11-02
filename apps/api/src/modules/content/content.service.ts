import { HttpError } from '../../middleware/errors.js';
import { contentRepository } from './content.repository.js';

export const contentService = {
  async getPage(slug: string) {
    const page = await contentRepository.findPublishedPage(slug);
    if (!page) throw new HttpError(404, 'PAGE_NOT_FOUND', 'Page not found');
    return page;
  },
  listProgrammes: () => contentRepository.listPublishedProgrammes(),
  createEnquiry: (input: Parameters<typeof contentRepository.createEnquiry>[0]) => contentRepository.createEnquiry(input),
};
