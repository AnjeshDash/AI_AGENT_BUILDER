import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
  args: {
    name:v.string(),
    email:v.string()
  },
  handler:async(ctx,args)=>{
    // if user already exist
    const existingUser = await ctx.db
      .query('UserTable')
      .filter(q => q.eq(q.field('email'), args.email))
      .first();
    
    //If Not, Then Create new user
    if(!existingUser){
      const userData = {
        name:args.name,
        email:args.email,
        token:5000
      }
      const userId = await ctx.db.insert('UserTable',userData);
      // Return the full user object with _id and token
      return {
        _id: userId,
        ...userData
      };
    }
    
    // Return existing user with all fields including token
    return existingUser;
  }

  
})