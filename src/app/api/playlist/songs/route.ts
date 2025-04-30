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

    const { playlistId, songId } = await request.json();
    if (!playlistId || !songId) {
      return NextResponse.json({ success: false, error: "Playlist ID and Song ID are required" }, { status: 400 });
    }

    // Verify playlist exists and belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: user.id },
    });
    if (!playlist) {
      return NextResponse.json({ success: false, error: "Playlist not found" }, { status: 404 });
    }

    // Check if song exists
    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      return NextResponse.json({ success: false, error: "Song not found" }, { status: 404 });
    }

    // Check if song is already in playlist
    const existingSong = await prisma.playlistSong.findUnique({
      where: { playlistId_songId: { playlistId, songId } },
    });
    if (existingSong) {
      return NextResponse.json({ success: false, error: "Song already in playlist" }, { status: 400 });
    }

    // Get current songs to determine next order
    const currentSongs = await prisma.playlistSong.findMany({
      where: { playlistId },
      orderBy: { order: "asc" },
    });
    const nextOrder = currentSongs.length > 0 ? Math.max(...currentSongs.map((s) => s.order)) + 1 : 0;

    // Add song to playlist
    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        order: nextOrder,
      },
      include: { song: true },
    });

    return NextResponse.json({ success: true, data: playlistSong }, { status: 201 });
  } catch (error) {
    console.error("Error adding song to playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to add song to playlist" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { playlistId, songId } = await request.json();
    if (!playlistId || !songId) {
      return NextResponse.json({ success: false, error: "Playlist ID and Song ID are required" }, { status: 400 });
    }

    // Verify playlist exists and belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: user.id },
    });
    if (!playlist) {
      return NextResponse.json({ success: false, error: "Playlist not found" }, { status: 404 });
    }

    // Remove song from playlist
    await prisma.playlistSong.delete({
      where: { playlistId_songId: { playlistId, songId } },
    });

    // Reorder remaining songs
    const remainingSongs = await prisma.playlistSong.findMany({
      where: { playlistId },
      orderBy: { order: "asc" },
    });
    await Promise.all(
      remainingSongs.map((song, index) =>
        prisma.playlistSong.update({
          where: { playlistId_songId: { playlistId, songId: song.songId } },
          data: { order: index },
        })
      )
    );

    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error("Error removing song from playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to remove song from playlist" }, { status: 500 });
  }
}