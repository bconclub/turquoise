/**
 * Build Information
 * 
 * This file exports build-time information that is set during deployment.
 * NEXT_PUBLIC_BUILD_TIME and NEXT_PUBLIC_GIT_COMMIT_MSG are set during the build process in the deployment script.
 */

export const BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME || null;
export const GIT_COMMIT_MSG = process.env.NEXT_PUBLIC_GIT_COMMIT_MSG || null;
