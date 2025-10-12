"use client"

import React from 'react'
import { NAV_ITEMS } from '@/lib/constant'
import Link from 'next/link'
import { usePathname } from 'next/navigation';

const NavItems = () => {
    const pathname = usePathname();
    const isActive: (link: string)=>boolean  = (link: string) =>{
        if(link === "/"){
            return pathname === "/";
        }
        return pathname.startsWith(link);
    }
  return (
    <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium '>
       { 
            NAV_ITEMS.map( ({label, link})=>{

                return  <li key={label}>
                    <Link href={link} className={` transition-colors ${ isActive(link) ? "text-gray-100":""} hover:text-yellow-500` } > 
                        {label}
                    </Link>
                </li>
            })
       }

    </ul>
  )
}

export default NavItems
