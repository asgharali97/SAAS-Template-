import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

async function POST(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthroized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUniqe({ where: { id: userId } });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const subscriptionEnds = new Date();
    subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1);

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionEnds,
        isSubscribed: true,
      },
    });

    return NextResponse.json({
      message: "Subscribed successfully",
      subscriptionEnds: updateUser.subscriptionEnds,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function GET(req: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthriozed not found" },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUniqe({
      where: { id: userId },
      select: {
        isSubscribed: true,
        subscriptionEnds: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "user not found" }, { status: 404 });
    }

    const currDate = new Date();

    if (user.subscriptionEnds && user.subscriptionEnds < currDate) {
      const update = await prisma.user.update({
        where: { id: userId },
        select: {
          isSubscribed: false,
          subscriptionEnds: null,
        },
      });
      return NextResponse.json({
        isSubscription: false,
        subscriptionEnds: null,
      });
    }

    return NextResponse.json({
      isSubscribed: user.isSubscribed,
      subscriptionEnds: user.subscriptionEnds,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
