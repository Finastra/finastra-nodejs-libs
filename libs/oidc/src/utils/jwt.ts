export const removeSignatureFromJwt = (jwt: string) => {
  return jwt.split('.').slice(0, 2).join('.');
};
