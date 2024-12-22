import { authOptions } from '@/lib/auth';
import { prisma } from '@/prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Session not found', {
      status: 401,
    });
  }

  try {
    const data = await prisma.event.findMany({
      where: { userId: session.user.id },
      orderBy: [{ createdAt: 'asc' }],
    });

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to fetch events', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('Session not found', {
      status: 401,
    });
  }

  const reqData = await req.json();
  try {
    const data = await prisma.event.create({
      data: {
        ...reqData,
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to create event', { status: 500 });
  }
}
