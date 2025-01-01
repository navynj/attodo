import { prisma } from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;

  const post = await prisma.note.findUnique({
    where: {
      id,
    },
  });

  return NextResponse.json({ post });
};

export async function PATCH(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const data = await req.json();

  const res = await prisma.note.update({
    where: {
      id: id,
    },
    data,
  });

  return NextResponse.json(res, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  const res = await prisma.note.delete({
    where: {
      id: id,
    },
  });

  return NextResponse.json(res, { status: 200 });
}
