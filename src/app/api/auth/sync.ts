// pages/api/auth/sync.ts
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "../../../../generated/prisma";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user } = req.body;
  if (!user || !user.id || !user.email) {
    return res.status(400).json({ error: "Invalid user data" });
  }

  try {
    const { id, email, user_metadata } = user;
    await prisma.user.upsert({
      where: { id },
      update: { email },
      create: {
        id,
        email,
        listenerProfile:
          user_metadata.userType === "LISTENER"
            ? {
                create: {
                  username: user_metadata.fullName,
                  fullName: user_metadata.fullName,
                  aboutMe: user_metadata.aboutMe,
                  profilePic: user_metadata.profilePic,
                },
              }
            : undefined,
        artistProfile:
          user_metadata.userType === "ARTIST"
            ? {
                create: {
                  stageName: user_metadata.fullName,
                  bio: user_metadata.aboutMe,
                  profilePic: user_metadata.profilePic,
                  genreTags: [], // Add default or prompt later
                  instrumentTags: [],
                },
              }
            : undefined,
      },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error syncing user:", error);
    return res.status(500).json({ error: "Failed to sync user" });
  }
}