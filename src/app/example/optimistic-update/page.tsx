'use client';
import dynamic from 'next/dynamic';

const PostForm = dynamic(() => import('@/components/domain/example/optimistic-update/post-form'), {
  ssr: false,
  loading: () => <p>loading</p>,
});

const PostList = dynamic(() => import('@/components/domain/example/post-list'), {
  ssr: false,
  loading: () => <p>loading</p>,
});

export default function Page() {
  return (
    <div className="flex">
      <div className="flex-1">
        <PostList />
      </div>
      <div className="flex-1">
        <PostForm />
      </div>
    </div>
  );
}
