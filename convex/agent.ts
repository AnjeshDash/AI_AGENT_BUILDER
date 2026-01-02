import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateAgent = mutation({
  args: { name: v.string(), agentId: v.string(), userId: v.id('UserTable') },
  handler: async (ctx, args) => {
    return await ctx.db.insert('AgentTable', {
      name: args.name,
      agentId: args.agentId,
      published: false,
      userId: args.userId
    });
  }
});

export const GetUserAgents = query({
  args: { userId: v.id('UserTable') },
  handler: async (ctx, args) => {
    return await ctx.db.query('AgentTable')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .collect();
  }
});

export const GetAgentById = query({
  args: { agentId: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db.query('AgentTable')
      .filter(q => q.eq(q.field('agentId'), args.agentId))
      .collect();
    return result[0] || null;
  }
});

export const UpdateAgentDetail = mutation({
  args: { id: v.id('AgentTable'), nodes: v.any(), edges: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { edges: args.edges, nodes: args.nodes });
    return { success: true, id: args.id };
  }
});

export const UpdateAgentToolConfig = mutation({
  args: { id: v.id('AgentTable'), agentToolConfig: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { agentToolConfig: args.agentToolConfig });
    return { success: true, id: args.id };
  }
});

export const DeleteAgent = mutation({
  args: { id: v.id('AgentTable') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  }
});