import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateData = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    userId: v.id('UserTable'),
    content: v.optional(v.any()),
    url: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.insert('DataTable', {
      name: args.name,
      type: args.type,
      userId: args.userId,
      content: args.content,
      url: args.url,
      size: args.size,
      mimeType: args.mimeType,
      description: args.description
    });
    return result;
  }
});

export const GetUserData = query({
  args: {
    userId: v.id('UserTable')
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('DataTable')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();
    return result;
  }
});

export const GetDataById = query({
  args: {
    dataId: v.id('DataTable')
  },
  handler: async (ctx, args) => {
    const result = await ctx.db.get(args.dataId);
    return result;
  }
});

export const UpdateData = mutation({
  args: {
    id: v.id('DataTable'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.any()),
    url: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const updateData: any = {};
    if (args.name !== undefined) updateData.name = args.name;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.content !== undefined) updateData.content = args.content;
    if (args.url !== undefined) updateData.url = args.url;
    await ctx.db.patch(args.id, updateData);
    return { success: true, id: args.id };
  }
});

export const DeleteData = mutation({
  args: {
    id: v.id('DataTable')
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  }
});

