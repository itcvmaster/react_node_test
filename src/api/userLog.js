import { baseApi } from '../utils/baseApi';

export async function getUserLogs(token) {
  return await baseApi('/user-logs', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function createUserLog(log) {
  return await baseApi('/user-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log),
  });
}

export async function deleteUserLog(logId, token) {
  return await baseApi(`/user-logs/${logId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
} 