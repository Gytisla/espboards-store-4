export default defineEventHandler(async () => {
  // Logout is primarily handled client-side by clearing the token
  // This endpoint can be used for server-side cleanup if needed
  return {
    success: true,
  }
})
