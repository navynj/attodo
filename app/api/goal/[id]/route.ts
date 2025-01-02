import { prisma } from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;

  try {
    const goal = await prisma.goal.findUnique({
      where: {
        id,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error(error);
    return new Response('Failed to get goal', { status: 500 });
  }
};

export async function PATCH(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    const res = await prisma.goal.update({
      where: {
        id: id,
      },
      data,
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to update goal:' + id, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const res = await prisma.goal.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to delete goal:' + id, { status: 500 });
  }
}
