import React from 'react'
import { useState } from 'react';
import Logo from '../components/Logo';
import Navbar from '../components/Navbar';
import HomeNav from './HomeNav';

function SignUp() {

const[form,setForm]=useState({
        username:"",
        email:"",
        password:"",
        confirmpassword:""
    })

    function handleChange(e){
        const{name,value}=e.target;
        setForm({...form,
            [name]:value
        })
    }



  return (  
    
    <div className='flex flex-col bg-black bg-[url(APNA-GAANA-FULL-STACK/APNA-GAANA-APP/Apna-gaana/src/assets/background-auth.jpg)] text-white w-[100%] h-screen bg-black-800 justify-center items-center'><HomeNav/>
    
    <form action="" method="post" className='flex flex-col  w-[35%] bg-purple-800 h-[75%] rounded-2xl hover:shadow justify-center items-center gap-8'>
        <Logo/>
        <h1 className='flex items-start text-white text-6xl border-y-gray-800 mt-0 font-serif mb-4'>Sign-Up</h1>
            <input type="text" className='w-[90%]  font-serif text-white h-[40px] rounded flex-col justify-center items-center border border-gray-800 text-center' name='username' value={form.username} onChange={handleChange} placeholder='Enter username'/>


            <input type="email" className='w-[90%] text-center font-serif h-[40px] rounded flex-col justify-center items-center border border-gray-800' name='email' value={form.email} onChange={handleChange} placeholder='Enter Your Gmail ID' />

            <input type="password" className='w-[90%] text-center font-serif h-[40px] rounded flex-col justify-center items-center border border-gray-800' name='password' value={form.password} onChange={handleChange} placeholder='Enter Password' />

            <input type="password" className='w-[90%] text-center font-serif h-[40px] rounded flex-col justify-center items-center border border-gray-800' name='confirmpassword' value={form.password} onChange={handleChange} placeholder='Enter Password'/>

            <input type="submit" value="Submit" className='bg-black p-3 rounded pr-4 font-serif'/>
            <p>already have an account?<span className='text-blue-500 underline font-serif'>Login</span> </p>

        </form>
        </div>
  )
}

export default SignUp