'use client'

import React, { useState } from 'react'
import { login, signup } from './actions'

const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSignUp(e.target.checked)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative">
        {/* Switch Container */}
        <div className="relative flex flex-col items-center justify-center gap-8 mb-8">
          <label className="relative cursor-pointer">
            {/* Hidden Checkbox */}
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isSignUp}
              onChange={handleToggle}
            />
            
           
            <div className="w-12 h-5 bg-white border-2 border-gray-800 rounded-md shadow-[4px_4px_0_#323232] transition-colors duration-300 peer-checked:bg-blue-500 relative">
              <div 
                className={`w-4 h-4 bg-white border-2 border-gray-800 rounded-sm absolute -top-0.5 transition-transform duration-300 shadow-[0_3px_0_#323232] ${
                  isSignUp ? 'translate-x-6 -left-0.01' : '-left-0.5'
                }`} 
              />
            </div>
            
            {/* Side Labels */}
            <span className={`absolute -left-[70px] top-0 w-[100px] text-gray-800 font-semibold transition-all duration-300 ${!isSignUp ? 'underline' : 'no-underline'}`}>
              Log in
            </span>
            <span className={`absolute left-[70px] top-0 w-[100px] text-gray-800 font-semibold transition-all duration-300 ${isSignUp ? 'underline' : 'no-underline'}`}>
              Sign up
            </span>
          </label>
        </div>

        {/* Flip Card Container */}
        <div className="w-[300px] h-[350px] relative [perspective:1000px]">
          <div
            className={`relative w-full h-full text-center transition-transform duration-700 [transform-style:preserve-3d] ${
              isSignUp ? '[transform:rotateY(180deg)]' : ''
            }`}
          >
            {/* Login Form (Front) */}
            <div className="absolute inset-0 [backface-visibility:hidden] bg-gray-300 border-2 border-gray-800 rounded-lg shadow-[4px_4px_0_#323232] p-5 flex flex-col justify-center gap-5">
              <h2 className="text-2xl font-black text-gray-800 my-5">Log in</h2>
              
              <form className="flex flex-col items-center gap-5">
                <input
                  name="email"
                  placeholder="Email"
                  type="email"
                  required
                  className="w-[250px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-base font-semibold text-gray-800 px-2.5 outline-none placeholder:text-gray-600 placeholder:opacity-80 focus:border-blue-500 transition-colors"
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  required
                  className="w-[250px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-base font-semibold text-gray-800 px-2.5 outline-none placeholder:text-gray-600 placeholder:opacity-80 focus:border-blue-500 transition-colors"
                />
                <button
                  formAction={login}
                  className="my-5 w-[120px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-lg font-semibold text-gray-800 cursor-pointer transition-all hover:bg-gray-50 active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  Let's go!
                </button>
              </form>
            </div>

            {/* Sign Up Form (Back) */}
            <div className="absolute inset-0 w-full [transform:rotateY(180deg)] [backface-visibility:hidden] bg-gray-300 border-2 border-gray-800 rounded-lg shadow-[4px_4px_0_#323232] p-5 flex flex-col justify-center gap-5">
              <h2 className="text-2xl font-black text-gray-800 my-5">Sign up</h2>
              
              <form className="flex flex-col items-center gap-5">
                <input
                  name="name"
                  placeholder="Name"
                  type="text"
                  className="w-[250px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-base font-semibold text-gray-800 px-2.5 outline-none placeholder:text-gray-600 placeholder:opacity-80 focus:border-blue-500 transition-colors"
                />
                <input
                  name="email"
                  placeholder="Email"
                  type="email"
                  required
                  className="w-[250px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-base font-semibold text-gray-800 px-2.5 outline-none placeholder:text-gray-600 placeholder:opacity-80 focus:border-blue-500 transition-colors"
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  required
                  className="w-[250px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-base font-semibold text-gray-800 px-2.5 outline-none placeholder:text-gray-600 placeholder:opacity-80 focus:border-blue-500 transition-colors"
                />
                <button
                  formAction={signup}
                  className="my-5 w-[120px] h-10 rounded-md border-2 border-gray-800 bg-white shadow-[4px_4px_0_#323232] text-lg font-semibold text-gray-800 cursor-pointer transition-all hover:bg-gray-50 active:shadow-none active:translate-x-1 active:translate-y-1"
                >
                  Confirm!
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
