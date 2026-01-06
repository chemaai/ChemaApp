const API_URL = 'https://chema-00yh.onrender.com';

export async function getCurrentHilo(userId: string) {
  const response = await fetch(`${API_URL}/api/hilos/current?user_id=${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.hilo;
}

export async function loadMessages(hiloId: string, limit: number = 40) {
  const response = await fetch(`${API_URL}/api/hilos/${hiloId}/messages?limit=${limit}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.messages || [];
}

export async function saveMessage(hiloId: string, role: 'user' | 'assistant', content: string) {
  const response = await fetch(`${API_URL}/api/hilos/${hiloId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.message;
}

export async function getAllHilos(userId: string) {
  const response = await fetch(`${API_URL}/api/hilos?user_id=${userId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.hilos || [];
}

export async function createNewHilo(userId: string, title: string) {
  const response = await fetch(`${API_URL}/api/hilos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, title })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data.hilo;
}

export async function switchHilo(hiloId: string) {
  const response = await fetch(`${API_URL}/api/hilos/${hiloId}/activate`, {
    method: 'POST'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
}

export async function renameHilo(hiloId: string, newTitle: string) {
  const response = await fetch(`${API_URL}/api/hilos/${hiloId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
}

export async function deleteHilo(hiloId: string) {
  const response = await fetch(`${API_URL}/api/hilos/${hiloId}`, {
    method: 'DELETE'
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
}

