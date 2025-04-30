import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface LikeRequest {
  songId: string;
  liked: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { songId, liked }: LikeRequest = await request.json();

    // Validate input
    if (!songId || typeof liked !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Invalid songId or liked status" },
        { status: 400 }
      );
    }

    // Fetch current song data
    const { data: song, error: fetchError } = await supabase
      .from("songs")
      .select("id, likes, liked")
      .eq("id", songId)
      .single();

    if (fetchError || !song) {
      return NextResponse.json(
        { success: false, error: "Song not found" },
        { status: 404 }
      );
    }

    // Update likes count and liked status
    const newLikes = liked ? (song.likes || 0) + 1 : Math.max(0, (song.likes || 0) - 1);
    const { data, error: updateError } = await supabase
      .from("songs")
      .update({ likes: newLikes, liked })
      .eq("id", songId)
      .select("id, likes, liked")
      .single();

    if (updateError || !data) {
      console.error("Supabase update error:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update like status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { liked: data.liked, likes: data.likes },
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}