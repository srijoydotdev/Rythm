import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { error } from "console";

export async function POST(request:NextRequest) {
    try{
        const{songId} = await request.json();
        if (!songId){
            return NextResponse.json({success:false , error:'Missin songId'} , {status:400});
        }
        const updatedSong = await prisma.song.update({
            where: { id: songId },
            data: { plays: { increment: 1 } },
            select: { plays: true },
          });
      
          return NextResponse.json({ success: true, data: { plays: updatedSong.plays } }, { status: 200 });
        } catch (error) {
          console.error('Error updating play count:', error);
          return NextResponse.json({ success: false, error: 'Failed to update play count' }, { status: 500 });
      
    }
}