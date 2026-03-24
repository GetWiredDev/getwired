/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as analysis from "../analysis.js";
import type * as competitors from "../competitors.js";
import type * as crons from "../crons.js";
import type * as helpers from "../helpers.js";
import type * as keywords from "../keywords.js";
import type * as knowledgeBase from "../knowledgeBase.js";
import type * as monitoring from "../monitoring.js";
import type * as projects from "../projects.js";
import type * as reddit from "../reddit.js";
import type * as responses from "../responses.js";
import type * as scanning from "../scanning.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  analysis: typeof analysis;
  competitors: typeof competitors;
  crons: typeof crons;
  helpers: typeof helpers;
  keywords: typeof keywords;
  knowledgeBase: typeof knowledgeBase;
  monitoring: typeof monitoring;
  projects: typeof projects;
  reddit: typeof reddit;
  responses: typeof responses;
  scanning: typeof scanning;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
