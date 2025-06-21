import { z } from 'zod';

export const schema = z.object({
  title: z.string().min(1, { message: '제목을 입력하세요' }),
  body: z.string().min(1, { message: '내용을 입력하세요' }),
});

export type CreatePostInput = z.infer<typeof schema>;

export type Post = {
  title: string;
  body: string;
};
