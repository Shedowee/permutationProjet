import { useEffect, useState } from "react";
import Layout from "../../shared/layouts/Layout";
import Card from "../../shared/components/Card";
import Button from "../../shared/components/Button";
import { useAuth } from "../hooks/useAuth";
import { updateUser } from "../../services/usersService";

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setForm({ nom: user.nom || "", email: user.email || "", password: "" });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateUser({
        id: user.id,
        name: form.nom,
        email: form.email,
        password: form.password || undefined,
      });
      setMessage("Profil mis à jour");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setMessage(err.response?.data?.message || "Échec de mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Card className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-white mb-4">Mon Profil</h1>
        {message && (
          <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 text-blue-200 rounded-lg">
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nom</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </form>
      </Card>
    </Layout>
  );
};

export default Profile;
