import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      if (!url.includes('/auth/')) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        onUnauthorized?.()
      }
    }
    return Promise.reject(error)
  },
)

export default api

export const authApi = {
  registerMember: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/member/register', data),
  registerAuthor: (data: { email: string; password: string; name?: string }) =>
    api.post('/auth/author/register', data),
  loginAdmin: (data: { email: string; password: string }) =>
    api.post('/auth/admin/login', data),
  logout: () => api.post('/auth/logout'),
}

export const usersApi = {
  getUser: (id: number) => api.get(`/users/${id}`),
}

export const adminApi = {
  createAuthor: (data: { name: string; email: string; bio?: string }) =>
    api.post('/admin/authors', data),
}

export const membersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/members', { params }),
  getMyProfile: () => api.get('/members/me'),
  getOne: (id: number) => api.get(`/members/${id}`),
  create: (data: { email: string; name: string; phone?: string; address?: string }) =>
    api.post('/members', data),
  update: (id: number, data: { name?: string; phone?: string; address?: string }) =>
    api.patch(`/members/${id}`, data),
  remove: (id: number) => api.delete(`/members/${id}`),
}

export const authorsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/authors', { params }),
  getOne: (id: number) => api.get(`/authors/${id}`),
  update: (id: number, data: { name?: string; bio?: string }) =>
    api.patch(`/authors/${id}`, data),
  remove: (id: number) => api.delete(`/authors/${id}`),
}

export const categoriesApi = {
  getAll: () => api.get('/book-categories'),
}

export const publishersApi = {
  getAll: () => api.get('/publishers'),
}

export const booksApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; publisherId?: number; publishYear?: number }) =>
    api.get('/books', { params }),
  getOne: (id: number) => api.get(`/books/${id}`),
  create: (data: {
    title: string;
    isbn: string;
    publishYear?: number;
    authorId?: number;
    publisherId?: number;
    categoryId?: number;
    imageUrlS?: string;
    imageUrlM?: string;
    imageUrlL?: string;
  }) => api.post('/books', data),
  update: (id: number, data: {
    title?: string;
    isbn?: string;
    publishYear?: number;
    authorId?: number;
    publisherId?: number;
    categoryId?: number;
    imageUrlS?: string;
    imageUrlM?: string;
    imageUrlL?: string;
  }) => api.patch(`/books/${id}`, data),
  remove: (id: number) => api.delete(`/books/${id}`),
}

export const borrowingsApi = {
  borrow: (data: { memberId: number; bookId: number }) =>
    api.post('/borrowings', data),
  getByMember: (memberId: number) =>
    api.get(`/borrowings/member/${memberId}`),
  returnBook: (id: number) =>
    api.patch(`/borrowings/${id}/return`),
}

export const membershipCardsApi = {
  getByMember: (memberId: number) =>
    api.get(`/membership-cards/member/${memberId}`),
}
