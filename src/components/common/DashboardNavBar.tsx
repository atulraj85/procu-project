"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface IUserProfileData {
  name: string;
  // Add other user profile properties as needed
}

interface IUserProfileResponse {
  response?: {
    data?: IUserProfileData;
  };
}

interface IProps {
  loading: boolean;
  userProfile: IUserProfileResponse | null;
}

function getInitials(inputString: string): string {
  const words = inputString.split(" ");
  const initials = words.map((word) => word.charAt(0).toUpperCase()).join("");
  return initials;
}

function DashboardNavBar({ loading, userProfile }: IProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  return (
    <div className="flex justify-end pt-3 pb-3 pr-6">
      <Popover>
        <PopoverTrigger>
          <div className="flex gap-4 items-center">
            {loading ? (
              <Skeleton className="w-[2.07463rem] h-[2.07463rem] rounded-full" />
            ) : (
              <div>
                <Avatar className="w-[2.07463rem] h-[2.07463rem]">
                  <AvatarImage
                    src="/images/user_alt_icon.png"
                    alt="User avatar"
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {getInitials(userProfile?.response?.data?.name || "")}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            <div>
              <img src="/images/chevron_down_icon.png" alt="chevron down" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="cursor-pointer w-[200px]">
          <div className="flex flex-col">
            <button 
              onClick={handleLogout}
              className="p-2 text-left hover:bg-gray-100 w-full"
            >
              Logout
            </button>
            <Link 
  href="/dashboard/manager/updateProfile"
  className="block p-2 hover:bg-gray-100 w-full text-left"
>
  Update Profile
</Link>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DashboardNavBar;