"use client";

import axios from "axios";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import qs from "query-string"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { useModal } from "@/app/hooks/useModal";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Copy, Gavel, Loader2, MoreVertical, RefreshCw, Shield, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { useOrigin } from "@/app/hooks/useOrigin";
import { useState } from "react";
import { CommunityWithMembersWithProfiles } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { UserAvatar } from "../UserAvatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuTrigger,
    DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "@prisma/client";

const roleIconMap = {
    "GUEST": null,
    "MODERATOR": <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
    "ADMIN": <ShieldAlert className="h-4 w-4 text-rose-500" />
}

const MembersModal = () => {

    const router  = useRouter()

    const { isOpen, onClose, type, data, onOpen } = useModal();

    const isModalOpen = isOpen && type === "members";

    const { community } = data as { community: CommunityWithMembersWithProfiles }

    const [loadingId, setLoadingId] = useState("")

    const onKick = async (memberId: string) => {
        try {
          setLoadingId(memberId);
          const url = qs.stringifyUrl({
            url: `/api/members/${memberId}`,
            query: {
              communityId: community?.id,
            },
          });
    
          const response = await axios.delete(url);
    
          router.refresh();
          onOpen("members", { community: response.data });
        } catch (error) {
          console.log(error);
        } finally {
          setLoadingId("");
        }
      }

      
    const onRoleChange = async (memberId: string, role: MemberRole) => {

        try {
            setLoadingId(memberId)

            const url = qs.stringifyUrl({
                url: `/api/members/${memberId}`,
                query: {
                    communityId: community?.id,
                }
            })

            const response = await axios.patch(url, {role})

            router.refresh()
            onOpen("members",{ community: response.data})
        } catch (error) {
            console.log(error)
        } finally {
            setLoadingId("")
        }
    }


    return (
        <div >
            <Dialog open={isModalOpen} onOpenChange={onClose}>

                <DialogContent className=" overflow-hidden">
                    <DialogHeader className="pt-8 px-6">
                        <DialogTitle className="text-2xl  text-center font-bold">
                            Manage Members
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-500">
                            {community?.members?.length} Members
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="mt-8 max-h-[420px] pr-6">
                        {community?.members?.map((member) => (
                            <div key={member.id} className="flex items-center gap-x-2 mb-6">
                                <UserAvatar src={member.profile.imageUrl} />
                                <div className="flex flex-col gap-y-1">
                                    <div className="text-xs font-semibold flex items-center gap-x-1">
                                        {member.profile.name}
                                        {roleIconMap[member.role]}
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        {member.profile.email}
                                    </p>
                                </div>
                                {community.profileId !== member.profileId && loadingId !== member.id && (
                                    <div className="ml-auto">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <MoreVertical className="h-4 w-4 text-zinc-500" />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="left">
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger
                                                        className="flex items-center"
                                                    >
                                                        <ShieldQuestion
                                                            className="w-4 h-4 mr-2"
                                                        />
                                                        <span>Role</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuPortal>
                                                        <DropdownMenuSubContent>
                                                            <DropdownMenuItem
                                                                onClick={() => onRoleChange(member.id, "GUEST" ) }
                                                            >
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Guest
                                                                {member.role === "GUEST" && (
                                                                    <Check
                                                                        className="h-4 w-4 ml-auto"
                                                                    />
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => onRoleChange(member.id, "MODERATOR" ) }
                                                            >
                                                                <ShieldCheck className="h-4 w-4 mr-2" />
                                                                Moderator
                                                                {member.role === "MODERATOR" && (
                                                                    <Check
                                                                        className="h-4 w-4 ml-auto"
                                                                    />
                                                                )}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuSubContent>
                                                    </DropdownMenuPortal>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => onKick(member.id)}                                                >
                                                    <Gavel className="h-4 w-4 mr-2" />
                                                    Kick
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                                {loadingId === member.id && (
                                    <Loader2
                                        className="animate-spin text-zinc-500 ml-auto w-4 h-4"
                                    />
                                )}
                            </div>
                        ))}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default MembersModal