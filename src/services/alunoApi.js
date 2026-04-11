const BASE = import.meta.env.VITE_API_URL ?? '/api';

// --- Helpers ---

const getToken = () => localStorage.getItem('access_token');

const safeJson = async (r) => {
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: true, status: r.status, message: text.slice(0, 120) }; }
};

const post = (url, body = {}) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
  body: JSON.stringify(body),
}).then(safeJson);

const get = (url) => fetch(url, {
  headers: { 'Authorization': `Bearer ${getToken()}` },
}).then(safeJson);

const postPublic = (url, body = {}) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then(safeJson);

// --- Sessão ---

export const saveSession = (data) => {
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user', JSON.stringify(data.user));
};

export const clearSession = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

// ─────────────────────────────────────────────
// 🔐 AUTH
// ─────────────────────────────────────────────
export const auth = {
  login:          (email, password)   => postPublic(`${BASE}/auth/login`, { email, password }),
  logout:         (refresh_token)     => postPublic(`${BASE}/auth/logout`, { refresh_token }),
  refresh:        (refresh_token)     => postPublic(`${BASE}/auth/refresh`, { refresh_token }),
  forgotPassword: (email)             => postPublic(`${BASE}/auth/forgot-password`, { email }),
  resetPassword:  (token, password)   => postPublic(`${BASE}/auth/reset-password`, { token, password }),
};

// ─────────────────────────────────────────────
// 👤 PERFIL
// ─────────────────────────────────────────────
export const users = {
  me:             ()                                => get(`${BASE}/aluno/users/me`),
  update:         (data)                            => post(`${BASE}/aluno/users/me/update`, data),
  password:       (current_password, new_password)  => post(`${BASE}/aluno/users/me/password`, { current_password, new_password }),
  metrics:        ()                                => get(`${BASE}/aluno/users/me/metrics`),
  addMetric:      (data)                            => post(`${BASE}/aluno/users/me/metrics`, data),
  feedback:       (message)                         => post(`${BASE}/aluno/users/me/feedback`, { message }),
  uploadAvatar:   (formData)                        => fetch(`${BASE}/aluno/users/me/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${getToken()}` },
    body: formData,
  }).then(safeJson),
  notifPrefs:     ()                                => get(`${BASE}/aluno/users/me/notification-preferences`),
  updateNotifPrefs: (data)                          => post(`${BASE}/aluno/users/me/notification-preferences`, data),
};

// ─────────────────────────────────────────────
// 🏋️ TREINOS
// ─────────────────────────────────────────────
export const workouts = {
  plan:          ()                  => get(`${BASE}/workouts/plan`),
  dayExercises:  (dayId)             => get(`${BASE}/workouts/days/${dayId}/exercises`),
  startLog:      (day_id)            => post(`${BASE}/workouts/logs`, { day_id }),
  saveExercises: (logId, exercises)  => post(`${BASE}/workouts/logs/${logId}/exercises`, { exercises }),
  finishLog:     (logId, completed)  => post(`${BASE}/workouts/logs/${logId}/finish`, { completed }),
  history:       ()                  => get(`${BASE}/workouts/logs/history`),
  streak:        ()                  => get(`${BASE}/workouts/streak`),
};

// ─────────────────────────────────────────────
// 📈 EVOLUÇÃO
// ─────────────────────────────────────────────
export const progress = {
  weight:         (period = '6m')      => get(`${BASE}/aluno/progress/weight?period=${period}`),
  addWeight:      (weight_kg, recorded_at) => post(`${BASE}/aluno/progress/weight`, { weight_kg, recorded_at }),
  strength:       ()                   => get(`${BASE}/aluno/progress/strength`),
  strengthByEx:   (exercise)           => get(`${BASE}/aluno/progress/strength/${encodeURIComponent(exercise)}`),
  measurements:   ()                   => get(`${BASE}/aluno/progress/measurements`),
  photos:         ()                   => get(`${BASE}/aluno/progress/photos`),
  addPhoto:       (data)               => post(`${BASE}/aluno/progress/photos`, data),
  deletePhoto:    (id)                 => post(`${BASE}/aluno/progress/photos/${id}/delete`),
  badges:         ()                   => get(`${BASE}/aluno/progress/badges`),
};

// ─────────────────────────────────────────────
// 🥗 NUTRIÇÃO
// ─────────────────────────────────────────────
export const nutrition = {
  plan:           ()                   => get(`${BASE}/aluno/nutrition/plan`),
  planMeals:      (planId)             => get(`${BASE}/aluno/nutrition/plan/${planId}/meals`),
  today:          ()                   => get(`${BASE}/aluno/nutrition/today`),
  logMeal:        (meal_id, consumed_at) => post(`${BASE}/aluno/nutrition/logs`, { meal_id, consumed_at }),
  removeLog:      (mealId)             => post(`${BASE}/aluno/nutrition/logs/${mealId}/delete`),
  note:           ()                   => get(`${BASE}/aluno/nutrition/note`),
  history:        ()                   => get(`${BASE}/aluno/nutrition/history`),
};

// ─────────────────────────────────────────────
// 🔔 NOTIFICAÇÕES
// ─────────────────────────────────────────────
export const notifications = {
  list:           ()     => get(`${BASE}/aluno/notifications`),
  markRead:       (id)   => post(`${BASE}/aluno/notifications/${id}/read`),
  markAllRead:    ()     => post(`${BASE}/aluno/notifications/read-all`),
  unreadCount:    ()     => get(`${BASE}/aluno/notifications/unread-count`),
};

// ─────────────────────────────────────────────
// 📊 DASHBOARD
// ─────────────────────────────────────────────
export const dashboard = {
  summary: () => get(`${BASE}/aluno/dashboard/summary`),
};
