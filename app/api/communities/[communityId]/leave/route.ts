import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { communityId: string } }
  ) {
    try {
      const profile = await currentProfile();
  
      if (!profile) {
        return new NextResponse("Unauthorized" ,{ status: 401 });
      }
  
      if (!params.communityId) {
        return new NextResponse("Server ID missing", { status: 400 });
      }
  
      const community = await db.community.update({
        where: {
          id: params.communityId,
          profileId: {
            not: profile.id
          }, 
          members: {
            some: {
                profileId: profile.id,
            }
          }
        },
        data: {
          members: {
            deleteMany: {
                profileId: profile.id,
            }
          }
        }
      });
  
      return NextResponse.json(community);
    } catch (error) {
      console.log("[MEMBER_ID_DELETE]", error);
      return new NextResponse("Internal Error", { status: 500 });
    }
  }
  