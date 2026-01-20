import api from "./api";

const mapUserFromApi = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status,
});

export const listUsers = async () => {
  const res = await api.get("/api/users", { withCredentials: true });
  const data = res.data?.data ?? [];
  return data.map(mapUserFromApi);
};

export const createUser = async ({ name, email, password, role, status }) => {
  const payload = {
    nom: name,
    email,
    password,
    role,
    status,
  };
  const res = await api.post("/api/users", payload, { withCredentials: true });
  return mapUserFromApi(res.data?.data);
};

export const updateUser = async ({ id, name, email, password, role, status }) => {
  const payload = {
    ...(name ? { nom: name } : {}),
    ...(email ? { email } : {}),
    ...(password ? { password } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };
  const res = await api.put(`/api/users/${id}`, payload, { withCredentials: true });
  return mapUserFromApi(res.data?.data);
};

export const deleteUser = async (id) => {
  await api.delete(`/api/users/${id}`, { withCredentials: true });
  return id;
};

