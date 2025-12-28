"use client";
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useEffect, useState } from 'react'
import { UserDetailContext } from './context/UserDrtailContext';

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
      const {user} = useUser();
      const createUser=useMutation(api.user.CreateNewUser);
      const [userDetail,setUserDetail] = useState<any>();

      
      const CreateAndGetUser = async() => {
        if(user)
        {
          const result = await createUser({
            name:user.fullName??'',
            email:user.primaryEmailAddress?.emailAddress??''
        });
        console.log(result);
        setUserDetail(result)



        useEffect(()=>{
        user&&CreateAndGetUser();
      },[user])
        }
        //Save to Context

      }
  return (
    <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
    <div>
      {children}
    </div>
    </UserDetailContext.Provider>
  )
}

export default Provider
