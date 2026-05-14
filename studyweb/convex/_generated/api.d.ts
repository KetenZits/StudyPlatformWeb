/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as achievements from "../achievements.js";
import type * as activities from "../activities.js";
import type * as admin from "../admin.js";
import type * as answers from "../answers.js";
import type * as categories from "../categories.js";
import type * as comments from "../comments.js";
import type * as dailyQuests from "../dailyQuests.js";
import type * as leaderboard from "../leaderboard.js";
import type * as notifications from "../notifications.js";
import type * as posts from "../posts.js";
import type * as reports from "../reports.js";
import type * as store from "../store.js";
import type * as studyRoom from "../studyRoom.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  achievements: typeof achievements;
  activities: typeof activities;
  admin: typeof admin;
  answers: typeof answers;
  categories: typeof categories;
  comments: typeof comments;
  dailyQuests: typeof dailyQuests;
  leaderboard: typeof leaderboard;
  notifications: typeof notifications;
  posts: typeof posts;
  reports: typeof reports;
  store: typeof store;
  studyRoom: typeof studyRoom;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
