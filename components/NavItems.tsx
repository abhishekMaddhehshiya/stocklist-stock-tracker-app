"use client";
import { NAV_ITEMS } from '@/lib/constant'
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import SearchCommand from "@/components/SearchCommand";

const NavItems = ({initialStocks}: { initialStocks: StockWithWatchlistStatus[]}) => {
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
                if(href === '/search') return (
                    <li key="search-trigger">
                        <SearchCommand
                            renderAs="text"
                            label="Search"
                            initialStocks={initialStocks}
                        />
                    </li>
                )

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
