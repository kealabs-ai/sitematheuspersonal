const BASE = import.meta.env.VITE_API_URL;
if (!BASE) throw new Error('[alunoApi] VITE_API_URL não definida. Configure o arquivo .env');

// --- Helpers ---

const getToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');

const safeJson = async (r) => {
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: true, status: r.status, message: text.slice(0, 120) }; }
};

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (token) => {
  refreshQueue.forEach(cb => cb(token));
  refreshQueue = [];
};

const fetchWithAuth = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${getToken()}` },
  });

  if (res.status !== 401) return safeJson(res);

  // Token expirado — tenta refresh
  const refreshToken = getRefreshToken();
  if (!refreshToken) { clearSession(); window.location.href = '/login'; return {}; }

  if (isRefreshing) {
    return new Promise(resolve => {
      refreshQueue.push(async (newToken) => {
        const retry = await fetch(url, {
          ...options,
          headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${newToken}` },
        });
        resolve(safeJson(retry));
      });
    });
  }

  isRefreshing = true;
  try {
    const refreshRes = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const refreshData = await refreshRes.json();

    if (!refreshData.access_token) {
      clearSession();
      window.location.href = '/login';
      return {};
    }

    localStorage.setItem('access_token', refreshData.access_token);
    if (refreshData.refresh_token) localStorage.setItem('refresh_token', refreshData.refresh_token);

    processQueue(refreshData.access_token);

    const retry = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${refreshData.access_token}` },
    });
    return safeJson(retry);
  } catch {
    clearSession();
    window.location.href = '/login';
    return {};
  } finally {
    isRefreshing = false;
  }
};

const post = (url, body = {}) => fetchWithAuth(url, { method: 'POST', body: JSON.stringify(body) });
const get  = (url)           => fetchWithAuth(url);

const postPublic = (url, body = {}) => fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}).then(safeJson);

// --- Sessão ---

export const saveSession = (data) => {
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('refresh_token', data.refresh_token);
  localStorage.setItem('user', JSON.stringify({
    id:    data.user?.id,
    role:  data.user?.role,
    name:  data.user?.name,
    email: data.user?.email,
  }));
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
  uploadAvatar:   (data)                            => post(`${BASE}/aluno/users/me/avatar`, data),
  recurringBilling:  (enabled) => post(`${BASE}/aluno/users/me/recurring-billing?enabled=${enabled}`),
  notifPrefs:     ()                                => get(`${BASE}/aluno/users/me/notification-preferences`),
  updateNotifPrefs: (data)                          => post(`${BASE}/aluno/users/me/notification-preferences`, data),
};

// ─────────────────────────────────────────────
// 🏋️ TREINOS
// ─────────────────────────────────────────────
export const workouts = {
  plan:          ()                  => get(`${BASE}/aluno/workouts/plan`),
  dayExercises:  (dayId)             => get(`${BASE}/aluno/workouts/template-days/${dayId}/exercises`),
  startLog:      (day_id, training)   => post(`${BASE}/aluno/workouts/logs`, { day_id, training }),
  saveExercises: (logId, exercises)  => post(`${BASE}/aluno/workouts/logs/${logId}/exercises`, { exercises }),
  finishLog:     (logId, completed)  => post(`${BASE}/aluno/workouts/logs/${logId}/finish`, { completed }),
  history:       ()                  => get(`${BASE}/aluno/workouts/logs/history`),
  streak:        ()                  => get(`${BASE}/aluno/workouts/streak`),
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
  plan:      ()                        => get(`${BASE}/nutrition/plan`),
  today:     ()                        => get(`${BASE}/nutrition/today`),
  note:      ()                        => get(`${BASE}/nutrition/note`),
  logMeal:   (meal_id, consumed_at)    => post(`${BASE}/nutrition/logs`, { meal_id, consumed_at }),
  removeLog: (mealId)                  => post(`${BASE}/nutrition/logs/${mealId}/delete`),
  history:   ()                        => get(`${BASE}/nutrition/history`),
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
