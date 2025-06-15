'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

type Post = {
  title: string;
  body: string;
};

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
  if (!res.ok) {
    throw new Error(`서버 오류: ${res.status}`);
  }
  return res.json();
}

export default function PostList() {
  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useSuspenseQuery<Post[]>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  return (
    <div className="p-6">
      <h1 className="mb-4 text-xl font-bold">게시글 목록</h1>
      <ul className="space-y-2">
        {posts && posts.length > 0 ? (
          posts.map((post, idx) => (
            <li key={idx} className="rounded border p-4 shadow transition hover:bg-gray-50">
              {post.title}
            </li>
          ))
        ) : (
          <li>게시글이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}
