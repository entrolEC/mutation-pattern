'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSmartMutation } from '@/lib/useSmartMutation';
import { CreatePostInput, schema } from '@/lib/types';
import { createPost } from '@/lib/fetcher';

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

  const mutation = useSmartMutation({ queryKey: ['posts'], mutationFn: createPost, isCollection: true });

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
