import { CreatePostInput, Post } from '@/lib/types';

export async function createPost(data: CreatePostInput) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || '서버 오류가 발생했습니다.');
  }

  return (await res.json()) as Post;
}
