'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '../../lib/auth';

export default function ArtistStatus() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const userData = await getUser();
      if (!userData || userData.prismaUser?.role !== 'ARTIST') {
        router.push('/profile');
        return;
      }
      setUser(userData);
    }
    fetchUser();
  }, [router]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl mb-4">Artist Status</h1>
        <p>Verification Status: {user.prismaUser.artistProfile.verificationStatus}</p>
        {user.prismaUser.artistProfile.verificationStatus === 'PENDING' && (
          <p>Your application is under review. Please wait for admin approval.</p>
        )}
        {user.prismaUser.artistProfile.verificationStatus === 'APPROVED' && (
          <p>Congratulations! You are now a verified artist.</p>
        )}
        {user.prismaUser.artistProfile.verificationStatus === 'REJECTED' && (
          <p>Sorry, your application was rejected. Please contact support.</p>
        )}
      </div>
    </div>
  );
}