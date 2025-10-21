import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10;

async function GET(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";

  try {
    const todos = await prisma.todos.findUnique({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });

    const totalItems = await prisma.todos.count({
      where: {
        userId,
        title: {
          contains: search,
          mode: "insensitve",
        },
      },
    });

    const totalPages = Math.floor(totalItems / ITEMS_PER_PAGE);

    return NextResponse.json({
      todos,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    return NextResponse.json({ error: "Error getting todo" }, { status: 500 });
  }
}

async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "" }, { status: 500 });
  }

  const user = await prisma.user.findUniqe({
    where: { id: userId },
    includes: { todos: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.isSubscribed && user.todos.length >= 3) {
    return NextResponse.json(
      {
        error: "You have hit the limit , Subscribe to write todos",
      },
      { status: 403 }
    );
  }

  try {
    const { title } = await req.json();

    const todo = await prisma.todo.create({
      data: { title, userId },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error while creating todo" },
      { status: 500 }
    );
  }
}
