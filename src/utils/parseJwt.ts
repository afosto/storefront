import { jwtDecode } from 'jwt-decode';

export const parseJwt = (token?: string) => (token ? jwtDecode(token) : null);
