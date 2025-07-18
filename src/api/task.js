import { baseApi } from '../utils/baseApi';

export async function getTasks(token) {
  return await baseApi('/tasks', {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
}

export async function createTask(task, token) {
  return await baseApi('/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(task),
  });
}

export async function updateTask(taskId, updates, token) {
  return await baseApi(`/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(taskId, token) {
  return await baseApi(`/tasks/${taskId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
} 