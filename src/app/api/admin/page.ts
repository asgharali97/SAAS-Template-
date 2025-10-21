import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

async function isAdmin(userId: string) {
  const user = await clerkClient.user.getUser(userId);
  return user.publicMetadata.role === "admin";
}

async function GET(req: NextRequest) {
  const { userId } = auth();

  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthroized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const page = parseInt(searchParams.get("page") || "1");

  try {
    let user;
    if (email) {
      await prisma.user.findUniqe({
        where: { email },
        includes: {
          todos: {
            orderBy: { createdAt: "desc" },
            take: ITEMS_PER_PAGE,
            skip: (page - 1) * ITEMS_PER_PAGE,
          },
        },
      });
    }
    const totalItems = email
      ? await prisma.todo.count({ where: { user: { email } } })
      : 0;
    const totalPages = Math.floor(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({ user, totalPages, currentPage: page });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function PUT(req: NextRequest) {
  const { userId } = auth();

  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthroized" }, { status: 401 });
  }

  try {
    const { todoCompleted, isSubscribed, todoId, todoTitle, email } =
      await req.json();

    if (isSubscribed !== undefined) {
      await prisma.user.update({
        where: { email },
        data: {
          isSubscribed,
          subscriptionEnds: isSubscribed
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            : null,
        },
      });
    }

    if (todoId) {
      await prisma.todo.update({
        where: { id: todoId },
        data: {
          completed: todoCompleted !== undefined ? todoCompleted : undefined,
          title: todoTitle || undefined,
        },
      });
    }

    return NextResponse.json(
      { error: "Successfully updated" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error updating todo" }, { status: 500 });
  }
}

async function DELETE(req: NextRequest) {
  const { userId } = auth();

  if (!userId || !(await isAdmin(userId))) {
    return NextResponse.json({ error: "Unauthroized" }, { status: 401 });
  }

  try {
    const { todoId } = await req.json();
    if (!todoId) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    await prisma.todo.delete({ where: { id: todoId } });
    return NextResponse.json(
      { error: "Successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Error deleting todo" }, { status: 500 });
  }
}

