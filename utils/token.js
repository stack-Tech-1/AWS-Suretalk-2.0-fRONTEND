// C:\Users\SMC\Documents\GitHub\AWS-Suretalk-2.0-fRONTEND\utils\token.js
export const decodeToken = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  export const getIsAdminFromToken = (token) => {
    const decoded = decodeToken(token);
    return decoded?.isAdmin || false;
  };