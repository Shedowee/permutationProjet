import api from "./api";

const mapUserFromApi = (u) => ({
  id: u.id,
  name: u.name,
  nom: u.nom || u.name,
  email: u.email,
  role: u.role,
  status: u.status,
  phone: u.phone,
  age: u.age,
  address: u.address,
  photo_url: u.photo_url,
});

export const listUsers = async (page = 1, limit = 5, filters = {}) => {
  const params = { page, limit, ...filters };
  const res = await api.get("/api/users", { 
    params,
    withCredentials: true 
  });
  const data = res.data?.data ?? [];
  const meta = res.data?.meta;
  return {
    data: data.map(mapUserFromApi),
    meta
  };
};

export const createUser = async ({ name, email, password, role, status }) => {
  const payload = {
    name,
    email,
    password,
    role,
    status,
  };
  const res = await api.post("/api/users", payload, { withCredentials: true });
  return mapUserFromApi(res.data?.user || res.data?.data);
};

export const updateUser = async ({ id, name, email, password, role, status, age, phone, address }) => {
  const payload = {
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    ...(password ? { password } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(age !== undefined ? { age } : {}),
    ...(phone !== undefined ? { phone } : {}),
    ...(address !== undefined ? { address } : {}),
  };
  const res = await api.put(`/api/users/${id}`, payload, { withCredentials: true });
  return mapUserFromApi(res.data?.user || res.data?.data);
};

export const deleteUser = async (id) => {
  await api.delete(`/api/users/${id}`, { withCredentials: true });
  return id;
};

export const getUserDetail = async (id) => {
  const res = await api.get(`/api/users/${id}`, { withCredentials: true });
  return res.data?.data;
};

export const updateProfilePicture = async (formData) => {
  const res = await api.post("/api/user/profile-picture", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
  });
  return res.data;
};

export const listUserDocuments = async () => {
  const res = await api.get("/api/user/documents", { withCredentials: true });
  return res.data?.data ?? [];
};

export const uploadUserDocument = async (formData) => {
  const res = await api.post("/api/user/documents", formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true
  });
  return res.data;
};

export const deleteUserDocument = async (id) => {
  const res = await api.delete(`/api/user/documents/${id}`, { withCredentials: true });
  return res.data;
};
