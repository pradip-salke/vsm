import type { RequestHandler } from 'express';
import { z } from 'zod';
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostAdmin,
  getBlogPostPublic,
  listBlogPostsAdmin,
  listBlogPostsPublic,
  setBlogPostStatus,
  updateBlogPost,
} from './blog-posts.service.js';

const idOf = (req: Parameters<RequestHandler>[0]) => z.coerce.number().int().positive().parse(req.params.id);

export const adminListBlogPosts: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await listBlogPostsAdmin(req.query) });
};

export const adminGetBlogPost: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await getBlogPostAdmin(idOf(req)) });
};

export const adminCreateBlogPost: RequestHandler = async (req, res) => {
  res.status(201).json({ data: await createBlogPost(req.body, req.auth!.userId, req.requestId) });
};

export const adminUpdateBlogPost: RequestHandler = async (req, res) => {
  res.json({ data: await updateBlogPost(idOf(req), req.body, req.auth!.userId, req.requestId) });
};

export const adminSetBlogPostStatus: RequestHandler = async (req, res) => {
  res.json({ data: await setBlogPostStatus(idOf(req), req.body, req.auth!.userId, req.requestId) });
};

export const adminDeleteBlogPost: RequestHandler = async (req, res) => {
  await deleteBlogPost(idOf(req), req.auth!.userId, req.requestId);
  res.status(204).end();
};

export const publicListBlogPosts: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await listBlogPostsPublic(req.query) });
};

export const publicGetBlogPost: RequestHandler = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json({ data: await getBlogPostPublic(String(req.params.slug)) });
};
