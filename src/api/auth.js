import { baseApi } from '../utils/baseApi';

export async function loginUser({ email, password, role }) {
  return await baseApi('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
}

export async function signupUser({ email, password, role, fullName }) {
  return await baseApi('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, fullName }),
  });
} 