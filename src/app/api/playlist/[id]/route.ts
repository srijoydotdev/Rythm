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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const playlistId = parseInt(params.id);
    const playlist = await prisma.playlist.findFirst({
      where: { id: playlistId, userId: user.id },
    });
    if (!playlist) {
      return NextResponse.json({ success: false, error: "Playlist not found" }, { status: 404 });
    }

    await prisma.playlist.delete({ where: { id: playlistId } });
    return NextResponse.json({ success: true, data: {} }, { status: 200 });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json({ success: false, error: "Failed to delete playlist" }, { status: 500 });
  }
}