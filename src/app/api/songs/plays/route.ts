import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables:", {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey,
  });
  throw new Error("Supabase URL and service role key are required.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface PlayRequest {
  songId: string;
}

interface PlayResponse {
  plays: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const { songId }: PlayRequest = await request.json();

    // Validate input
    if (!songId) {
      return NextResponse.json(
        { success: false, error: "Invalid songId" },
        { status: 400 }
      );
    }

    // Fetch current song data
    const { data: song, error: fetchError } = await supabase
      .from("songs")
      .select("id, plays")
      .eq("id", songId)
      .single() as { data: { id: string; plays: number } | null; error: any };

    if (fetchError || !song) {
      console.error("Error fetching song:", fetchError?.message);
      return NextResponse.json(
        { success: false, error: "Song not found" },
        { status: 404 }
      );
    }

    // Update play count
    const newPlays = (song.plays || 0) + 1;
    const { data, error: updateError } = await supabase
      .from("songs")
      .update({ plays: newPlays })
      .eq("id", songId)
      .select("id, plays")
      .single() as { data: { id: string; plays: number } | null; error: any };

    if (updateError || !data) {
      console.error("Supabase update error:", updateError?.message);
      return NextResponse.json(
        { success: false, error: "Failed to update play count" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { plays: data.plays } as PlayResponse,
    });
  } catch (err: any) {
    console.error("API error in /api/songs/plays:", err.message);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}