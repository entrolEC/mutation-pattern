'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// 1️⃣ 클라이언트 측 필드 검증 스키마
const schema = z.object({
  title: z.string().min(1, { message: '제목을 입력하세요' }),
  body: z.string().min(1, { message: '내용을 입력하세요' }),
});

type CreatePostInput = z.infer<typeof schema>;

// 2️⃣ 서버에 게시글을 저장하는 비동기 함수
async function createPost(data: CreatePostInput) {
  const res = await fetch('/api/posts', {
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

// 3️⃣ 게시글 작성 폼 컴포넌트
export default function CreatePostForm() {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: createPost,
    // 7. 입력된 정보가 서버에 저장됨 + 캐시 교체
    onSuccess: (savedPost) => {
      // temp- 로 시작하는 임시 게시글을 실제 게시글로 교체
      console.log('savedPost', savedPost);
      queryClient.setQueryData<Array<Post>>(['posts'], (old = []) => [savedPost, ...old]);
    },
  });

  const onSubmit = (data: CreatePostInput) => {
    mutation.mutate(data);
  };

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-semibold">게시글 작성</h2>

        {/* 1. 사용자가 제목, 게시글 내용 등을 입력함 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input placeholder="제목" {...register('title')} disabled={isSubmitting} />
            {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <Textarea placeholder="내용" rows={6} {...register('body')} disabled={isSubmitting} />
            {errors.body && <p className="mt-1 text-sm text-red-500">{errors.body.message}</p>}
          </div>

          {/* 2. 사용자가 \"작성 완료\" 버튼을 클릭함 */}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '작성 중...' : '작성 완료'}
          </Button>

          {/* 5. 서버에서 에러가 발생하면 에러를 표시함 */}
          {mutation.isError && <p className="mt-2 text-sm text-red-500">{(mutation.error as Error).message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
