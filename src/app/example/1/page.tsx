import PostList from '@/components/domain/example/post-list';
import PostForm from '@/components/domain/example/1/post-form';
import { Suspense } from 'react';

export default function Page() {
  return (
    <div className="flex">
      <div className="flex-1">
        <Suspense fallback={<p>loading</p>}>
          <PostList />
        </Suspense>
      </div>
      <div className="flex-1">
        <PostForm />
      </div>
    </div>
  );
}
