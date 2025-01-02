import { prisma } from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;

  try {
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error(error);
    return new Response('Failed to get event', { status: 500 });
  }
};

export async function PATCH(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    const res = await prisma.event.update({
      where: {
        id: id,
      },
      data,
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to update event:' + id, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const res = await prisma.event.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(res, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Failed to delete event:' + id, { status: 500 });
  }
}
