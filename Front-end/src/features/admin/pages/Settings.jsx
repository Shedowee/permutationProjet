import React, { useState, useEffect } from "react";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import Table from "../../../shared/components/Table";
import Modal from "../../../shared/components/Modal";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  Bars3BottomLeftIcon,
  HashtagIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { listParametres, updateParametre, createParametre, deleteParametre } from "../../../services/paramService";

/**
 * Page de gestion des paramètres de l'application (Admin)
 * Permet de configurer les régions, villes, grades, etc.
 */
const Settings = () => {
  const [parametres, setParametres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("create"); // create, edit, delete
  const [selectedParam, setSelectedParam] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    code: "",
    libelle: "",
    actif: true,
    ordre: 0,
    parent_id: ""
  });
  const [filterType, setFilterType] = useState("");
  const [message, setMessage] = useState({ text: "", type: "success" });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const types = [
    { value: "", label: "Tous les types" },
    { value: "REGION", label: "Régions" },
    { value: "VILLE", label: "Villes" },
    { value: "ETAT", label: "États de demande" },
    { value: "STATUT_USER", label: "Statuts Utilisateur" },
    { value: "GRADE", label: "Grades" }
  ];

  const regions = parametres.filter(p => p.type === "REGION");

  const loadParametres = async () => {
    try {
      setLoading(true);
      const data = await listParametres({ include_inactive: true });
      // Map backend data (key, value.libelle) to frontend format (code, libelle)
      const mapped = data.map(p => ({
        ...p,
        code: p.key,
        libelle: p.value?.libelle || p.key
      }));
      setParametres(mapped);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors du chargement des paramètres", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParametres();
  }, []);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType]);

  const handleOpenCreate = () => {
    setModalType("create");
    setFormData({ type: "REGION", code: "", libelle: "", actif: true, ordre: 0, parent_id: "" });
    setShowModal(true);
  };

  const handleOpenEdit = (param) => {
    setModalType("edit");
    setSelectedParam(param);
    setFormData({
      type: param.type,
      code: param.code,
      libelle: param.libelle,
      actif: !!param.actif,
      ordre: param.ordre || 0,
      parent_id: param.parent_id || ""
    });
    setShowModal(true);
  };

  const handleOpenDelete = (param) => {
    setModalType("delete");
    setSelectedParam(param);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      if (modalType === "create") {
        await createParametre(formData);
        setMessage({ text: "Paramètre créé avec succès", type: "success" });
      } else if (modalType === "edit") {
        await updateParametre(selectedParam.id, {
          libelle: formData.libelle,
          actif: formData.actif,
          ordre: formData.ordre,
          parent_id: formData.parent_id
        });
        setMessage({ text: "Paramètre mis à jour avec succès", type: "success" });
      } else if (modalType === "delete") {
        await deleteParametre(selectedParam.id);
        setMessage({ text: "Paramètre supprimé avec succès", type: "success" });
      }
      setShowModal(false);
      loadParametres();
    } catch (err) {
      console.error(err);
      setMessage({ text: "Erreur lors de l'opération", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filteredParams = parametres.filter(p => !filterType || p.type === filterType);

  // Calculate pagination
  const totalItems = filteredParams.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedParams = filteredParams.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = [
    {
      header: "Type & Catégorie",
      key: "type",
      render: (val, row) => (
        <div className="flex flex-col space-y-1">
          <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-2 py-0.5 rounded-md w-fit">
            {val}
          </span>
          {val === "VILLE" && row.parent_id && (
            <div className="flex items-center text-[10px] text-surface-500 font-bold uppercase tracking-tighter">
              <MapPinIcon className="h-3 w-3 mr-1" />
              Région: {parametres.find(p => p.id === row.parent_id)?.libelle || "—"}
            </div>
          )}
        </div>
      )
    },
    {
      header: "Code Système",
      key: "code",
      render: (val) => (
        <code className="text-[11px] font-mono bg-surface-50 text-surface-700 px-2 py-1 rounded-lg border-2 border-jb-green/20">
          {val}
        </code>
      )
    },
    {
      header: "Libellé Affiché",
      key: "libelle",
      render: (val) => <span className="font-bold text-surface-900">{val}</span>
    },
    {
      header: "Ordre",
      key: "ordre",
      render: (val) => (
        <div className="flex items-center space-x-2 text-surface-500 font-bold">
          <Bars3BottomLeftIcon className="h-4 w-4" />
          <span>{val}</span>
        </div>
      )
    },
    {
      header: "État",
      key: "actif",
      render: (val) => (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          val ? "bg-teal-50 text-teal-600 border border-teal-100" : "bg-rose-50 text-rose-600 border border-rose-100"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full mr-2 ${val ? "bg-teal-500 animate-pulse" : "bg-rose-500"}`}></div>
          {val ? "Actif" : "Inactif"}
        </div>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-2 rounded-xl bg-white border-2 border-jb-cyan/20 text-surface-500 hover:text-primary-600 hover:border-primary-200 hover:shadow-[0_14px_26px_-16px_rgba(47,123,229,0.2)] transition-all group"
            title="Modifier"
          >
            <PencilIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => handleOpenDelete(row)}
            className="p-2 rounded-xl bg-white border-2 border-jb-green/20 text-surface-500 hover:text-rose-600 hover:border-rose-200 hover:shadow-[0_14px_26px_-16px_rgba(12,122,59,0.2)] transition-all group"
            title="Supprimer"
          >
            <TrashIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-fadeIn pb-12">
        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white rounded-lg shadow-[0_22px_46px_-26px_rgba(15,159,181,0.28)] border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10">
              <AdjustmentsHorizontalIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2 text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-1">
                <TagIcon className="h-3.5 w-3.5" />
                <span>Administration</span>
              </div>
              <h1 className="text-3xl font-black text-surface-900 tracking-tight">Configuration <span className="text-primary-600">Système</span></h1>
              <p className="text-surface-600 text-sm font-bold">Gérez les constantes et référentiels de l'application</p>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={handleOpenCreate}
            className="flex items-center space-x-3 px-8 py-4 rounded-lg shadow-[0_24px_50px_-28px_rgba(47,123,229,0.3)] group"
          >
            <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-black uppercase tracking-widest text-[10px]">Nouveau Paramètre</span>
          </Button>
        </div>

        {/* Messages de retour */}
        {message.text && (
          <div className={`p-5 rounded-lg border-2 flex items-center space-x-4 animate-slideUp ${
            message.type === 'success'
              ? 'bg-teal-50 border-teal-100 text-teal-700'
              : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            <div className={`p-2 rounded-xl ${message.type === 'success' ? 'bg-teal-500 text-white' : 'bg-rose-500 text-white'}`}>
              {message.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
            </div>
            <p className="text-xs font-black uppercase tracking-[0.1em]">{message.text}</p>
          </div>
        )}

        {/* Filtres et Tableau */}
        <div className="bg-white rounded-lg sm:rounded-lg p-4 sm:p-8 border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 shadow-[0_28px_64px_-38px_rgba(12,122,59,0.28)] space-y-6 sm:space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4 overflow-x-auto pb-2 sm:pb-0">
              <div className="relative group shrink-0">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-surface-600 group-focus-within:text-primary-500 transition-colors" />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-surface-50 border-2 border-jb-green/20 rounded-xl sm:rounded-lg pl-11 pr-10 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest text-surface-700 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none appearance-none cursor-pointer"
                >
                  {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <button
                onClick={loadParametres}
                className="p-3 rounded-xl sm:rounded-lg bg-surface-50 border-2 border-jb-cyan/20 text-surface-600 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all group shrink-0"
                title="Actualiser les données"
              >
                <ArrowPathIcon className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="flex items-center space-x-2 px-4 py-2 bg-surface-50 rounded-xl border-2 border-jb-green/20 self-start sm:self-auto">
              <HashtagIcon className="h-4 w-4 text-surface-600" />
              <span className="text-[10px] font-black text-surface-700 uppercase tracking-widest">
                {filteredParams.length} entrées trouvées
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl sm:rounded-lg">
            <Table
              columns={columns}
              data={paginatedParams}
              loading={loading}
              emptyMessage="Aucun paramètre configuré dans cette catégorie"
              className="max-h-[calc(100vh-28rem)] min-h-[400px]"
              pagination={{
                currentPage,
                totalPages,
                onPageChange: setCurrentPage,
                totalItems,
                pageSize
              }}
            />
          </div>
        </div>

        {/* Modal de Création/Édition */}
        <Modal
          isOpen={showModal && modalType !== "delete"}
          onClose={() => setShowModal(false)}
          title={modalType === "create" ? "Nouveau Paramètre" : "Modifier Paramètre"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1">Catégorie / Type *</label>
                <div className="relative group">
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                  className="w-full bg-surface-50 border-2 border-jb-green/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                    required
                  >
                    {types.filter(t => t.value !== "").map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-surface-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1">Code Système Unique *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full bg-surface-50 border-2 border-jb-cyan/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="EX: REG_CASABLANCA"
                  required
                  disabled={modalType === "edit"}
                />
              </div>
            </div>

            {formData.type === "VILLE" && (
              <div className="space-y-3 animate-slideDown">
                <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1">Région de rattachement *</label>
                <div className="relative group">
                  <select
                    name="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    className="w-full bg-primary-50 border border-primary-100 rounded-lg px-6 py-4 text-primary-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer"
                    required={formData.type === "VILLE"}
                  >
                    <option value="">Sélectionnez une région</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.libelle}</option>)}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-primary-600">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1">Libellé d'affichage *</label>
              <input
                type="text"
                name="libelle"
                value={formData.libelle}
                onChange={handleInputChange}
                  className="w-full bg-surface-50 border-2 border-jb-green/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
                placeholder="Le nom tel qu'il apparaîtra dans les menus"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-surface-600 uppercase tracking-[0.2em] ml-1">Priorité d'affichage</label>
                <input
                  type="number"
                  name="ordre"
                  value={formData.ordre}
                  onChange={handleInputChange}
                  className="w-full bg-surface-50 border-2 border-jb-cyan/20 rounded-lg px-6 py-4 text-surface-900 font-bold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all"
                  required
                />
              </div>

              <div className="flex items-center space-x-4 pt-5">
                <div className="relative inline-flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    id="actif"
                    name="actif"
                    checked={formData.actif}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-surface-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 transition-colors"></div>
                  <label htmlFor="actif" className="ml-4 text-[10px] font-black text-surface-700 uppercase tracking-widest cursor-pointer select-none">
                    Statut Actif
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-5 flex justify-end space-x-4 border-t-2 border-jb-cyan/15">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="px-8 py-4 rounded-lg font-black uppercase tracking-widest text-[10px]"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="px-12 py-4 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20"
              >
                {modalType === "create" ? "Créer l'entrée" : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Confirmation de Suppression */}
        <Modal
          isOpen={showModal && modalType === "delete"}
          onClose={() => setShowModal(false)}
          title="Confirmer la suppression"
        >
          <div className="space-y-6 py-2">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-lg border border-rose-100 animate-pulse">
                <TrashIcon className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-surface-900 font-black text-base uppercase tracking-tight">Suppression irréversible</p>
                <p className="text-surface-700 text-sm leading-relaxed font-medium">
                  Êtes-vous absolument certain de vouloir supprimer le paramètre <br />
                  <span className="text-rose-600 font-black uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md text-[10px]">
                    "{selectedParam?.libelle}"
                  </span> ?
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t-2 border-jb-cyan/15">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                className="px-8 py-4 rounded-lg font-black uppercase tracking-widest text-[10px]"
              >
                Garder
              </Button>
              <Button
                variant="danger"
                onClick={handleSubmit}
                className="px-12 py-4 rounded-lg font-black uppercase tracking-widest text-[10px] shadow-lg shadow-rose-500/20"
              >
                Oui, Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default Settings;
