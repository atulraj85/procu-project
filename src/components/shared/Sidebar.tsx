import React, { useEffect, useState } from "react";
import { SidebarItem } from "../../types/index";
import Image from "next/image";
import Procu from "./Procu";
import Link from "next/link";

interface SidebarProps {
  items: SidebarItem[];
  setActiveComponent: (value: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ items, setActiveComponent }) => {

      const [active, setActive] = useState<string>("Dashboard");
      
  return (
    <aside className="flex h-screen w-56 flex-col overflow-y-auto border-r bg-white px-5 py-8">
      <div className="text-black text-xl m-3 -ml-0.5">
        <Procu />
      </div>
      <div className="mt-6 flex flex-1 flex-col justify-between">
        <nav className="-mx-3 space-y-4">
          {items.map((item, index) => (
            <Link href={item.route} key={index}>
              <div className="space-y-3 ">
                <div
                  className={`flex transform items-center rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300  hover:text-gray-700 hover:bg-slate-50 cursor-pointer ${active === item.value ? "bg-gray-100 text-gray-700 cursor-pointer" : ""}`}
                  onClick={() => setActive(item.value)}
                >
                  <Image
                    src={item.imgUrl}
                    alt={item.label}
                    height={20}
                    width={20}
                  />
                  <span className="mx-2 text-sm font-medium">{item.label}</span>
                </div>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
