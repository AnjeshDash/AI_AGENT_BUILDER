import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateNewUser = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('UserTable')
      .filter(q => q.eq(q.field('email'), args.email))
      .first();
    
    if (!existingUser) {
      const userId = await ctx.db.insert('UserTable', {
        name: args.name,
        email: args.email,
        token: 5000
      });
      return { _id: userId, name: args.name, email: args.email, token: 5000 };
    }
    
    return existingUser;
  }
});

export const UpdateUser = mutation({
  args: {
    userId: v.id('UserTable'),
    name: v.optional(v.string()),
    subscription: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.subscription !== undefined) updateData.subscription = args.subscription;
    await ctx.db.patch(args.userId, updateData);
    return await ctx.db.get(args.userId);
  }
});

export const DeleteUser = mutation({
  args: { userId: v.id('UserTable') },
  handler: async (ctx, args) => {
    const [agents, dataSources] = await Promise.all([
      ctx.db.query('AgentTable').filter(q => q.eq(q.field('userId'), args.userId)).collect(),
      ctx.db.query('DataTable').withIndex('by_user', q => q.eq('userId', args.userId)).collect()
    ]);
    
    await Promise.all([
      ...agents.map(a => ctx.db.delete(a._id)),
      ...dataSources.map(d => ctx.db.delete(d._id)),
      ctx.db.delete(args.userId)
    ]);
    
    return { success: true };
  }
});