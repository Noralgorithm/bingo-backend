export function getErrorMessage(error: unknown) {
  let message = 'Unknown error'
  if (error instanceof Error) message = error.message
  return message
}
