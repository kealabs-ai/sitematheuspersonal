const BASE = 'https://srv1023256.hstgr.cloud/api';

const getToken = () => localStorage.getItem('access_token');

const safeJson = async (r) => {
  const text = await r.text();
  try { return JSON.parse(text); } catch { return { error: true, status: r.status, message: text.slice(0, 120) }; }
};

const req = (method, url, body) => {
  const token = getToken();
  if (!token) console.warn('[adminApi] Token ausente para:', url);
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }).then(safeJson);
};

const get  = (url)       => req('GET',    url);
const post = (url, body) => req('POST',   url, body);
const del  = (url)       => req('DELETE', url);

// ─── Alunos ───────────────────────────────────
export const adminUsers = {
  listAll: () => get(`${BASE}/aluno/users/all`),
  update:  (id, data) => post(`${BASE}/aluno/users/admin/${id}`, data),
};

// ─── Vídeos ───────────────────────────────────
export const adminVideos = {
  list:   ()             => get(`${BASE}/admin/videos`),
  create: (data)         => post(`${BASE}/admin/videos`, data),
  update: (id, data)     => post(`${BASE}/admin/videos/${id}`, data),
  delete: (id)           => del(`${BASE}/admin/videos/${id}`),
};

// ─── Treinos ──────────────────────────────────
export const adminWorkouts = {
  plans:          ()               => get(`${BASE}/aluno/workouts/admin/plans`),
  createPlan:     (data)           => post(`${BASE}/aluno/workouts/admin/plans`, data),
  updatePlan:     (id, data)       => post(`${BASE}/aluno/workouts/admin/plans/${id}/update`, data),
  deletePlan:     (id)             => post(`${BASE}/aluno/workouts/admin/plans/${id}/delete`),
  planDays:       (planId)         => get(`${BASE}/aluno/workouts/admin/plans/${planId}/days`),
  createDay:      (planId, data)   => post(`${BASE}/aluno/workouts/admin/plans/${planId}/days`, data),
  updateDay:      (dayId, data)    => post(`${BASE}/aluno/workouts/admin/days/${dayId}/update`, data),
  deleteDay:      (dayId)          => post(`${BASE}/aluno/workouts/admin/days/${dayId}/delete`),
  dayExercises:   (dayId)          => get(`${BASE}/aluno/workouts/admin/days/${dayId}/exercises`),
  createExercise: (dayId, data)    => post(`${BASE}/aluno/workouts/admin/days/${dayId}/exercises`, data),
  updateExercise: (exId, data)     => post(`${BASE}/aluno/workouts/admin/exercises/${exId}/update`, data),
  deleteExercise: (exId)           => post(`${BASE}/aluno/workouts/admin/exercises/${exId}/delete`),
  assignPlan:     (userId, planId) => post(`${BASE}/admin/workouts/assign`, { user_id: userId, plan_id: planId }),
};

// ─── Nutrição ─────────────────────────────────
export const adminNutrition = {
  plans:        ()               => get(`${BASE}/aluno/nutrition/plans/all`),
  createPlan:   (data)           => post(`${BASE}/aluno/nutrition/plans`, data),
  updatePlan:   (id, data)       => post(`${BASE}/aluno/nutrition/admin/plans/${id}/update`, data),
  deletePlan:   (id)             => post(`${BASE}/aluno/nutrition/admin/plans/${id}/delete`),
  planMeals:    (planId)         => get(`${BASE}/aluno/nutrition/plan/${planId}/meals`),
  createMeal:   (planId, data)   => post(`${BASE}/aluno/nutrition/admin/plans/${planId}/meals`, data),
  updateMeal:   (mealId, data)   => post(`${BASE}/aluno/nutrition/admin/meals/${mealId}/update`, data),
  deleteMeal:   (mealId)         => post(`${BASE}/aluno/nutrition/admin/meals/${mealId}/delete`),
  mealItems:    (mealId)         => get(`${BASE}/aluno/nutrition/admin/meals/${mealId}/items`),
  createItem:   (mealId, data)   => post(`${BASE}/aluno/nutrition/admin/meals/${mealId}/items`, data),
  updateItem:   (itemId, data)   => post(`${BASE}/aluno/nutrition/admin/items/${itemId}/update`, data),
  deleteItem:   (itemId)         => post(`${BASE}/aluno/nutrition/admin/items/${itemId}/delete`),
  saveNote:     (data)           => post(`${BASE}/aluno/nutrition/admin/notes`, data),
  assignPlan:   (userId, planId) => post(`${BASE}/aluno/nutrition/admin/assign`, { user_id: userId, plan_id: planId }),
};

// ─── Financeiro ───────────────────────────────
export const adminFinance = {
  payments: () => get(`${BASE}/payments/payments`),
  orders:   () => get(`${BASE}/aluno/orders/all`),
  students: () => get(`${BASE}/aluno/users/all`),
};
