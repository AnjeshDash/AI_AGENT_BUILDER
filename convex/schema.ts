import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  UserTable:defineTable({
    name:v.string(),
    email:v.string(),
    subscription:v.optional(v.string()),
    token:v.number()
  }),

  AgentTable: defineTable({
    agentId: v.string(),
    name: v.string(),
    config: v.optional(v.any()),
    nodes: v.optional(v.any()),
    edges: v.optional(v.any()),
    published: v.boolean(),
    userId:v.id('UserTable'),
    agentToolConfig:v.optional(v.any())
  }),

  DataTable: defineTable({
    name: v.string(),
    type: v.string(), // 'file', 'api', 'database', 'text'
    content: v.optional(v.any()),
    url: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
    userId: v.id('UserTable'),
    description: v.optional(v.string())
  }).index("by_user", ["userId"])
})