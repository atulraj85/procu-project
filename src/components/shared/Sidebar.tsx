// components/SidebarOne.tsx
import React from "react";
import { SidebarItem } from "../../types/index";
import Image from "next/image";
import Link from "next/link";

interface SidebarOneProps {
  items: SidebarItem[];
}

const Sidebar: React.FC<SidebarOneProps> = ({ items  }) => {
  return (
    <aside className="flex h-screen w-64 flex-col overflow-y-auto border-r bg-white px-5 py-8">
      <div className="mt-6 flex flex-1 flex-col justify-between">
        <nav className="-mx-3 space-y-4">
          {items.map((item, index) => (
            <div key={index} className="space-y-3 ">
              <Link
                className="flex transform items-center rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
                href={item.route}
              >
                <Image
                  src={item.imgUrl}
                  alt={item.value}
                  height={20}
                  width={20}
                />
                <span className="mx-2 text-sm font-medium">{item.label}</span>
              </Link>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
