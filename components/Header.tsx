import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import NavItems from './NavItems'
import UserDropdown from './UserDropdown'

const Header = () => {
  return (
    <header className='sticky top-0 header'>
        <div className='container header-wrapper'>
            <Link href={"/"}> 
                <Image src={"/assets/icons/logo.png"} alt='StockList logo' width={140} height={32} className='h-8 w-auto cursor-pointer' priority={true}/>
            </Link>
            <nav className=' hidden sm:block'>
                {/* <NavItems /> */}
                <NavItems/>
            </nav>

            <UserDropdown />

        </div>

    </header>
  )
}

export default Header
