// src/app/profile/page.tsx
import { supabase } from "../../app/lib/supabase";
import { redirect } from "next/navigation";
import { PrismaClient } from "../../../generated/prisma";

const prisma = new PrismaClient();

export default async function Profile() {
  // Check session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      listenerProfile: true,
      artistProfile: true,
    },
  });

  if (!user) {
    return <div className="text-white">User not found</div>;
  }

  const profile = user.listenerProfile || user.artistProfile;
  const name = user.listenerProfile?.fullName || user.artistProfile?.stageName || "User";
  const aboutMe = user.listenerProfile?.aboutMe || user.artistProfile?.bio || "";
  const profilePic = profile?.profilePic || "/profile-pic.jpg";
  const age = session.user.user_metadata?.age || "Not set";

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
      <div className="bg-[#1D1D1D] rounded-lg p-8 max-w-md w-full shadow-lg text-white">
        <img
          src={profilePic}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
        />
        <h1 className="text-3xl font-bold text-center mb-4">{name}</h1>
        <p className="text-gray-400 text-center mb-2">Age: {age}</p>
        <p className="text-gray-300 text-center mb-6">{aboutMe}</p>
        <div className="flex justify-center space-x-4">
          <a
            href="/song"
            className="bg-white text-black font-semibold py-2 px-4 rounded-md hover:bg-gray-200"
          >
            Back to Music
          </a>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="bg-[#2A2A2A] text-white font-semibold py-2 px-4 rounded-md border border-white/20 hover:bg-white/10"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}