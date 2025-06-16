import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Redis 인스턴스 생성
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { title, body } = data;

    if (!title || title.length <= 1 || !body || body.length <= 1) {
      return NextResponse.json({ message: 'title과 body는 각각 2자 이상이어야 합니다.' }, { status: 422 });
    }

    if (Math.random() < 0.1) {
      throw new Error('랜덤 에러 발생');
    }

    const timestamp = Date.now();
    const key = `post:${timestamp}-${Math.random().toString(36).substring(2)}`;

    await redis.set(key, data);

    await redis.zadd('posts:index', {
      score: timestamp, // 최신순 정렬용
      member: key,
    });

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: '서버 에러가 발생했습니다.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 최신 10개를 가져온다
    const keys = await redis.zrange('posts:index', 0, 9, { rev: true });
    const posts = await Promise.all(keys.map((k) => redis.get(k as string)));
    return NextResponse.json(posts.reverse(), { status: 200 });
  } catch (err) {
    return NextResponse.json({ message: '데이터 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
