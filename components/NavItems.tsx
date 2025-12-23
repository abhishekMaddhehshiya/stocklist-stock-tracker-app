"use client"

import React from 'react'
import { NAV_ITEMS } from '@/lib/constant'
import Link from 'next/link'
import { usePathname } from 'next/navigation';

const NavItems = () => {
    const pathname = usePathname();
    const isActive: (href: string)=>boolean  = (href: string) =>{
        if(href === "/"){
            return pathname === "/";
        }
        return pathname.startsWith(href);
    }
  return (
    <ul className='flex flex-col sm:flex-row p-2 gap-3 sm:gap-10 font-medium '>
       { 
            NAV_ITEMS.map( ({label, href})=>{

                return  <li key={label}>
                    <Link href={href} className={` transition-colors ${ isActive(href) ? "text-gray-100":""} hover:text-yellow-500` } > 
                        {label}
                    </Link>
                </li>
            })
       }

    </ul>
  )
}

export default NavItems
