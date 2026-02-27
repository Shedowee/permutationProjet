import { useEffect, useState, useRef } from "react";
import Layout from "../../shared/layouts/Layout";
import Card from "../../shared/components/Card";
import Button from "../../shared/components/Button";
import Modal from "../../shared/components/Modal";
import { useAuth } from "../hooks/useAuth";
import { updateUser, updateProfilePicture, listUserDocuments, uploadUserDocument, deleteUserDocument } from "../../services/usersService";
import { getCurrentEmploye } from "../../services/employeService";
import { formatDate } from "../../shared/utils/dateUtils";
import { 
  UserCircleIcon, 
  IdentificationIcon, 
  AcademicCapIcon, 
  MapPinIcon, 
  BuildingOfficeIcon, 
  CalendarIcon,
  CameraIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
  PlusIcon
} from "@heroicons/react/24/outline";

const Profile = () => {
  const { user } = useAuth();
  const [employe, setEmploye] = useState(null);
  const [form, setForm] = useState({ nom: "", email: "", password: "" });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmploye, setFetchingEmploye] = useState(false);
  const [uploadingDoc, setLoadingDoc] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  
  // Modal state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docForm, setDocForm] = useState({ title: "", file: null });

  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setForm({ nom: user.nom || user.name || "", email: user.email || "", password: "" });
      
      if (user.role === 'formateur' || user.role === 'employe') {
        loadEmployeDetails();
      }
      loadDocuments();
    }
  }, [user]);

  const loadEmployeDetails = async () => {
    try {
      setFetchingEmploye(true);
      const data = await getCurrentEmploye();
      setEmploye(data);
    } catch (err) {
      console.error("Erreur détails employé:", err);
    } finally {
      setFetchingEmploye(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await listUserDocuments();
      setDocuments(data);
    } catch (err) {
      console.error("Erreur documents:", err);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      await updateProfilePicture(formData);
      setMessage("Photo de profil mise à jour");
      setMessageType("success");
      window.location.reload();
    } catch (err) {
      setMessage("Erreur lors de l'upload de l'image");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault();
    if (!docForm.file || !docForm.title) return;

    const formData = new FormData();
    formData.append('document', docForm.file);
    formData.append('title', docForm.title);

    try {
      setLoadingDoc(true);
      await uploadUserDocument(formData);
      setMessage("Document ajouté avec succès");
      setMessageType("success");
      setIsDocModalOpen(false);
      setDocForm({ title: "", file: null });
      loadDocuments();
    } catch (err) {
      setMessage("Erreur lors de l'upload du document");
      setMessageType("error");
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await deleteUserDocument(id);
      loadDocuments();
      setMessage("Document supprimé");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de la suppression");
      setMessageType("error");
    }
  };

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
      setMessage("Profil mis à jour avec succès");
      setMessageType("success");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setMessage(err.response?.data?.message || "Échec de la mise à jour");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Mon Profil</h1>
            <p className="text-gray-400 mt-1 font-medium">Gérez vos informations et documents professionnels</p>
          </div>
          
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white text-4xl font-black shadow-2xl border-4 border-gray-900 overflow-hidden relative">
              {user?.profile_picture ? (
                <img src={`${import.meta.env.VITE_API_URL}/storage/${user.profile_picture}`} alt="Profil" className="h-full w-full object-cover" />
              ) : (
                (user?.nom || user?.name || "U")[0].toUpperCase()
              )}
              <button 
                onClick={() => fileInputRef.current.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <CameraIcon className="h-8 w-8 text-white" />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleProfilePictureChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section Informations de Compte */}
          <div className="lg:col-span-1 space-y-8">
            <Card className="p-8">
              <h2 className="text-lg font-bold text-white mb-8 flex items-center uppercase tracking-widest">
                <UserCircleIcon className="h-6 w-6 mr-3 text-primary-500" />
                Compte
              </h2>
              
              {message && (
                <div className={`mb-8 p-4 rounded-2xl text-sm font-bold border animate-fadeIn ${
                  messageType === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nom Complet</label>
                  <input
                    type="text"
                    name="nom"
                    value={form.nom}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                    placeholder="Laisser vide pour ne pas changer"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full py-4 uppercase tracking-widest text-xs font-black shadow-xl" loading={loading}>
                  Enregistrer
                </Button>
              </form>
            </Card>
            
            <Card className="p-6 bg-gradient-to-br from-primary-600/10 to-primary-900/10 border-primary-500/20">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-widest">Rôle Actuel</h3>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black bg-primary-500/20 text-primary-400 border border-primary-500/30 uppercase tracking-[0.2em]">
                {user?.role || "Utilisateur"}
              </div>
            </Card>
          </div>

          {/* Section Détails & Documents */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8">
              <h2 className="text-lg font-bold text-white mb-8 flex items-center uppercase tracking-widest">
                <IdentificationIcon className="h-6 w-6 mr-3 text-accent-500" />
                Détails Professionnels
              </h2>

              {fetchingEmploye ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : employe ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <DetailItem icon={<IdentificationIcon className="h-5 w-5" />} label="Matricule" value={employe.matricule} />
                  <DetailItem icon={<IdentificationIcon className="h-5 w-5" />} label="CIN" value={employe.cin} />
                  <DetailItem icon={<AcademicCapIcon className="h-5 w-5" />} label="Grade" value={employe.grade?.libelle} />
                  <DetailItem icon={<CalendarIcon className="h-5 w-5" />} label="Recrutement" value={formatDate(employe.date_recrutement)} />
                  <DetailItem icon={<MapPinIcon className="h-5 w-5" />} label="Région" value={employe.region?.libelle} />
                  <DetailItem icon={<BuildingOfficeIcon className="h-5 w-5" />} label="Établissement" value={employe.etablissement?.nom} />
                </div>
              ) : (
                <p className="text-surface-400 italic text-center py-10">Aucun détail professionnel trouvé.</p>
              )}
            </Card>

            <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-white flex items-center uppercase tracking-widest">
                  <DocumentArrowUpIcon className="h-6 w-6 mr-3 text-primary-500" />
                  Documents
                </h2>
                <button 
                  onClick={() => setIsDocModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-primary-600/10 text-primary-400 hover:text-white hover:bg-primary-600 transition-all border border-primary-500/20 group"
                >
                  <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest">Ajouter</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-2xl flex items-center justify-between group hover:border-primary-500/30 transition-all">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2 bg-primary-600/10 rounded-lg text-primary-500">
                        <DocumentIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{doc.title}</p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-tighter">{doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={`${import.meta.env.VITE_API_URL}/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-white transition-colors">
                        <EyeIcon className="h-4 w-4" />
                      </a>
                      <button onClick={() => handleDeleteDoc(doc.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && !uploadingDoc && (
                  <div className="sm:col-span-2 py-10 text-center border-2 border-dashed border-gray-800 rounded-3xl">
                    <p className="text-surface-400 text-sm font-medium">Aucun document téléchargé</p>
                  </div>
                )}
                {uploadingDoc && (
                  <div className="p-4 bg-gray-800/30 border border-gray-700/50 rounded-2xl flex items-center space-x-3 animate-pulse">
                    <div className="h-10 w-10 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal d'ajout de document */}
      <Modal 
        isOpen={isDocModalOpen} 
        onClose={() => setIsDocModalOpen(false)} 
        title="Ajouter un document"
      >
        <form onSubmit={handleDocSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-400 uppercase tracking-widest ml-1">Titre du document</label>
            <input
              type="text"
              required
              value={docForm.title}
              onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
              placeholder="Ex: CV, Certificat, Diplôme..."
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-surface-400 uppercase tracking-widest ml-1">Fichier (PDF, Image)</label>
            <div 
              onClick={() => docInputRef.current.click()}
              className="w-full p-8 border-2 border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all group"
            >
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-600 group-hover:text-primary-500 mb-4 transition-colors" />
              <p className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                {docForm.file ? docForm.file.name : "Cliquez pour sélectionner un fichier"}
              </p>
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest">Max 5MB • PDF, JPG, PNG</p>
            </div>
            <input 
              type="file" 
              ref={docInputRef} 
              onChange={(e) => setDocForm({ ...docForm, file: e.target.files[0] })}
              className="hidden"
              accept=".pdf,image/*"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1 py-4 uppercase tracking-widest text-xs font-black"
              onClick={() => setIsDocModalOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 py-4 uppercase tracking-widest text-xs font-black shadow-xl"
              loading={uploadingDoc}
              disabled={!docForm.file || !docForm.title}
            >
              Télécharger
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start space-x-4">
    <div className="mt-1 p-2.5 bg-gray-800 rounded-2xl text-gray-500 border border-gray-700/50 transition-all">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-white font-bold text-lg truncate">{value || "—"}</p>
    </div>
  </div>
);

export default Profile;
