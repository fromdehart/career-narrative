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
import type * as claims from "../claims.js";
import type * as evidence from "../evidence.js";
import type * as http from "../http.js";
import type * as interview from "../interview.js";
import type * as narrative from "../narrative.js";
import type * as openai from "../openai.js";
import type * as profiles from "../profiles.js";
import type * as references from "../references.js";
import type * as resend from "../resend.js";
import type * as resume from "../resume.js";
import type * as roles from "../roles.js";
import type * as search from "../search.js";
import type * as telegram from "../telegram.js";
import type * as telegramClient from "../telegramClient.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  claims: typeof claims;
  evidence: typeof evidence;
  http: typeof http;
  interview: typeof interview;
  narrative: typeof narrative;
  openai: typeof openai;
  profiles: typeof profiles;
  references: typeof references;
  resend: typeof resend;
  resume: typeof resume;
  roles: typeof roles;
  search: typeof search;
  telegram: typeof telegram;
  telegramClient: typeof telegramClient;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
