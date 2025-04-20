// src/app/api/songs/likes/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(request: Request) {
  let body: { songId?: string; liked?: boolean } = {}; // ✅ Declare body outside try block

  try {
    body = await request.json();
    const { songId, liked } = body;

    if (!songId || typeof liked !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid request: songId and liked (boolean) are required" },
        { status: 400 }
      );
    }

    // Verify song exists
    const songExists = await prisma.song.findUnique({
      where: { id: songId },
      select: { id: true },
    });

    if (!songExists) {
      return NextResponse.json(
        { success: false, error: `Song with ID ${songId} not found` },
        { status: 404 }
      );
    }

    const updatedSong = await prisma.song.update({
      where: { id: songId },
      data: {
        likes: { increment: liked ? 1 : -1 },
        liked: liked,
      },
      select: { likes: true, liked: true },
    });

    return NextResponse.json({ success: true, data: updatedSong }, { status: 200 });
  } catch (error) {
    console.error("Error updating like status:", {
      error,
      type: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      songId: body?.songId, 
      liked: body?.liked,
    });

    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { success: false, error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update like status" },
      { status: 500 }
    );
  }
}
