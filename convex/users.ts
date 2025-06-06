import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserById = query({
    args: { userId: v.string() },
    handler: async (convexToJson, { userId }) => {
        const user = await convexToJson.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        return user;
    }
});

export const updateUser = mutation({
    args: {
        userId: v.string(),
        name: v.string(),
        email: v.string(),
    },

    // ctx is context
    handler: async (ctx, { userId, name, email }) => {
        //check if user exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        // update an existing user
        if (existingUser) {
            await ctx.db.patch(existingUser._id, {
                name,
                email
            });
            return existingUser._id;
        }

        // create new user
        const newUserId = await ctx.db.insert("users", {
            userId,
            name,
            email,
            stripeConnectId: undefined
        });
        return newUserId
    }
})