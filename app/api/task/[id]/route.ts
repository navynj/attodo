import { prisma } from '@/prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  const id = params.id;

  const task = await prisma.task.findUnique({
    where: {
      id,
    },
  });

  return NextResponse.json({ task });
};

export async function PATCH(
  req: NextRequest,
  { params: { id } }: { params: { id: string } }
) {
  const data = await req.json();

  const res = await prisma.task.update({
    where: {
      id: id,
    },
    data,
    include: {
      goal: true,
    }
  });

  return NextResponse.json(res, { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  const res = await prisma.task.delete({
    where: {
      id: id,
    },
  });
  
  return NextResponse.json(res, { status: 200 });
}
