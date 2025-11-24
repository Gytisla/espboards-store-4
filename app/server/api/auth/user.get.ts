export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader) {
    throw createError({
      statusCode: 401,
      message: 'No authorization header',
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'No token provided',
    })
  }

  const supabase = await createServerSupabaseClient(event)

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid token',
    })
  }

  return { user }
})
