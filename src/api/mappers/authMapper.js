export const mapLoginResponse = (data = {}) => ({
  userPin: data.userPin,
  userId: data.userId,
  username: data.username,
  token: data.token
})
