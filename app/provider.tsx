"use client";
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import React, { useEffect, useState, useCallback } from 'react'
import { UserDetailContext } from './context/UserDetailContext';
import { WorkflowContext } from './context/WorkflowContext';

const Provider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
      const {user, isLoaded} = useUser();
      const createUser = useMutation(api.user.CreateNewUser);
      const [userDetail, setUserDetail] = useState<any>();
      const [addedNodes, setAddedNodes] = useState([{
        id:'start',
        position:{x:400,y:300},
        data:{label:'Start'},
        type:'StartNode'
      }])
      const [nodeEdges, setNodeEdges] = useState([]); 

      const CreateAndGetUser = useCallback(async() => {
        if(!isLoaded || !user) {
          return;
        }

        if(!user.primaryEmailAddress?.emailAddress) {
          return;
        }

        try {
          const result = await createUser({
            name: user.fullName ?? '',
            email: user.primaryEmailAddress.emailAddress
          });
          console.log('User data:', result);
          setUserDetail(result);
        } catch (error) {
          console.error('Error creating/fetching user:', error);
        }
      }, [isLoaded, user, createUser]);

      useEffect(() => {
        if(isLoaded && user) {
          CreateAndGetUser();
        }
      }, [isLoaded, user, CreateAndGetUser]);

  return (
    <UserDetailContext.Provider value={{userDetail, setUserDetail}}>
      <WorkflowContext.Provider value={{addedNodes, setAddedNodes, nodeEdges, setNodeEdges}}>
      <div>
        {children}
      </div>
      </WorkflowContext.Provider>
    </UserDetailContext.Provider>
  )
}

export default Provider
