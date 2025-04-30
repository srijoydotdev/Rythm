import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { supabase } from "@/app/lib/supabase";

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }

  return user;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, isPublic } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, error: "Playlist name is required" }, { status: 400 });
    }

    // Check if playlist name already exists for the user
    const existingPlaylist = await prisma.playlist.findFirst({
      where: { name, userId: user.id },
    });
    if (existingPlaylist) {
      return NextResponse.json({ success: false, error: "Playlist name already exists" }, { status: 409 });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || "",
        isPublic: isPublic ?? true,
        userId: user.id,
      },
      include: { songs: { include: { song: true }, orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, data: playlist }, { status: 201 });
  } catch (error) {
    console.error("Error creating playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to create playlist" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const playlists = await prisma.playlist.findMany({
      where: { userId: user.id },
      include: { songs: { include: { song: true }, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: playlists });
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch playlists" }, { status: 500 });
  }
}