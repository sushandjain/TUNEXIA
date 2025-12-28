import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

function HomeNav() {
  return (
    <div className='w-screen h-[45px] bg-purple-950 mb-20 flex justify-between items-center p-2'>
        <ul className='ml-2'>
            <Logo />
        </ul>
        <h1 className='text-2xl font-serif '><span className='text-red-400'>W</span>elcome <span className='text-cyan-900'>To </span> 
        <span className='text-red-400'>T</span>UNEXIA </h1>
        
        <ul className='flex justify-between gap-5 font-serif p-4'><Link to="/">Home</Link>
            <Link to="/SignUp">Login</Link>
        <Link to="/Login">SignUp</Link>
        </ul>
    </div>
  )
}

export default HomeNav