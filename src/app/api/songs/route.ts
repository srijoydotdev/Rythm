import { NextRequest, NextResponse } from "next/server";
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

// Define types for Supabase response
interface Artist {
  id: string;
  name: string;
}

interface Like {
  id: string;
  userId: string;
}

interface SongFromSupabase {
  id: string;
  title: string;
  artistId: string;
  duration: number;
  cover: string | null;
  filePath: string;
  coverVideo: string | null;
  genre: string | null;
  createdAt: string;
  plays: number;
  artists: Artist[];
  likes: Like[];
}

async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("No valid Authorization header");
    return null;
  }

  const token = authHeader.replace("Bearer ", "");
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      console.error("Supabase auth error:", error?.message);
      return null;
    }
    console.log("User authenticated:", user.id);
    return user;
  } catch (err) {
    console.error("Error in getUserFromToken:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching /api/songs");
    console.log("SUPABASE_URL:", supabaseUrl ? "[REDACTED]" : "undefined");

    const user = await getUserFromToken(request);

    // Fetch songs with artist data
    const { data: songs, error: songsError } = await supabase
      .from("songs")
      .select(`
        id,
        title,
        artistId,
        duration,
        cover,
        filePath,
        coverVideo,
        genre,
        createdAt,
        plays,
        artists (id, name),
        likes (id, userId)
      `) as { data: SongFromSupabase[] | null; error: any };

    if (songsError || !songs) {
      console.error("Supabase error fetching songs:", songsError);
      throw new Error("Failed to fetch songs");
    }
    console.log("Songs fetched:", songs.length);

    const songsWithPlays = songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artists?.[0]?.name || song.artistId, // Access first artist's name
      duration: song.duration,
      cover: song.cover,
      audio: song.filePath,
      coverVideo: song.coverVideo,
      genre: song.genre,
      created_at: new Date(song.createdAt).toISOString(),
      plays: song.plays || 0,
      liked: user ? song.likes.some((like) => like.userId === user.id) : false,
      likes: song.likes.length,
    }));

    console.log("Returning songs:", songsWithPlays.length);
    return NextResponse.json({ success: true, data: songsWithPlays }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching songs:", error.message);
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      {
        success: false,
        error: isProduction ? "Failed to fetch songs" : error.message || "Failed to fetch songs",
      },
      { status: 500 }
    );
  }
}