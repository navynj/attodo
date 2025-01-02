import { prisma } from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;

  try {
    const task = await prisma.task.findUnique({
      where: {
        id,
      },
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error(error);
    return new Response('Failed to get task', { status: 500 });
  }
};

export async function PATCH(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const controller = new AbortController(); // 타임아웃 제어
  const timeout = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

  try {
    const data = await req.json();

    const res = await prisma.task.update({
      where: { id },
      data,
      include: { goal: true },
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    const err = error as Error;

    if (err.name === 'AbortError') {
      return new Response('Request timeout: ' + id, { status: 408 });
    }

    console.error('PATCH error:', err);
    return new Response('Failed to update task: ' + id, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const res = await prisma.task.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to delete task:' + id, { status: 500 });
  }
}
