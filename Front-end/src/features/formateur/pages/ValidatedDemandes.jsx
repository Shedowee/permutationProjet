import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import Button from "../../../shared/components/Button";
import DetailDemande from "../components/DetailDemande";
import Modal from "../../../shared/components/Modal";
import { fetchDemandes } from "../redux/formateurSlice";
import { listParametres } from "../../../services/paramService";
import { listEtablissementsByCity } from "../../../services/etablissementsService";
import { selectSearchTerm } from "../../../shared/redux/searchSlice";
import {
  EyeIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  MapPinIcon,
  InboxIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const ValidatedDemandes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const allDemandes = useSelector((state) => state.formateur.demandes.data);
  const meta = useSelector((state) => state.formateur.demandes.meta);
  const loading = useSelector((state) => state.formateur.demandes.loading);
  const error = useSelector((state) => state.formateur.demandes.error);

  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [etabs, setEtabs] = useState([]);
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [etabId, setEtabId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  useEffect(() => {
    dispatch(
      fetchDemandes({
        page: currentPage,
        limit: pageSize,
        filters: {
          search: searchTerm || globalSearchTerm,
          scope: "validated",
          region_id: regionId || undefined,
          ville_id: cityId || undefined,
          etablissement_id: etabId || undefined,
        },
      })
    );
  }, [dispatch, currentPage, searchTerm, globalSearchTerm, regionId, cityId, etabId]);

  useEffect(() => {
    (async () => {
      try {
        const regs = await listParametres({ type: "REGION" });
        setRegions(regs.map((r) => ({ id: r.id, name: r.value?.libelle || r.key })));
      } catch (err) {
        console.error("Failed to load regions", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!regionId) {
        setCities([]);
        setCityId("");
        setEtabs([]);
        setEtabId("");
        return;
      }
      try {
        const villes = await listParametres({ type: "VILLE", parent_id: regionId });
        setCities(villes.map((v) => ({ id: v.id, name: v.value?.libelle || v.key })));
      } catch (err) {
        console.error("Failed to load cities", err);
      }
    })();
  }, [regionId]);

  useEffect(() => {
    (async () => {
      if (!cityId) {
        setEtabs([]);
        setEtabId("");
        return;
      }
      try {
        const e = await listEtablissementsByCity(cityId);
        setEtabs(e.map((x) => ({ id: x.id, name: x.name })));
      } catch (err) {
        console.error("Failed to load establishments", err);
      }
    })();
  }, [cityId]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, globalSearchTerm, regionId, cityId, etabId]);

  const demandes = useMemo(() => allDemandes || [], [allDemandes]);
  const stats = useMemo(
    () => ({
      total: meta?.total || 0,
      validees: meta?.total || demandes.length,
    }),
    [demandes, meta]
  );

  const handleViewDetail = (demande) => {
    setSelectedDemande(demande);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedDemande(null);
  };

  return (
    <Layout>
      <div className="space-y-12 pb-12 max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-black text-surface-900 tracking-tight uppercase">
              Permutations validées
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="h-1 w-12 bg-primary-500 rounded-full"></span>
              <p className="text-surface-500 font-bold uppercase tracking-widest text-[10px]">
                Demandes validées par la commission et publiées pour consultation
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Button variant="ghost" size="lg" icon={ArrowLeftIcon} onClick={() => navigate("/formateur/demandes")}>
              Mes Demandes
            </Button>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-100 rounded-lg p-6 flex items-start gap-4 text-red-700"
          >
            <p className="text-sm font-bold uppercase tracking-widest">Erreur: {error}</p>
          </motion.div>
        )}

        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
            <StatItem label="Validées" value={stats.validees} icon={InboxIcon} color="success" />
            <StatItem label="Total" value={stats.total} icon={InboxIcon} color="primary" />
          </div>

          <Card noPadding className="bg-white border border-surface-100 rounded-lg overflow-hidden shadow-hard">
            <div className="p-8 border-b border-surface-50 bg-surface-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-500 rounded-xl shadow-primary">
                  <InboxIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-surface-900 uppercase tracking-widest">
                    Permutations validées
                  </h2>
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mt-0.5">
                    Filtre par région, ville et établissement
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="relative group min-w-[300px]">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Rechercher une permutation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#D8E9FB] border border-surface-200 rounded-xl pl-11 pr-10 py-3 text-sm font-bold text-surface-900 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-red-500 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <select value={regionId} onChange={(e) => { setRegionId(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-surface-200 rounded-xl px-4 py-3 text-sm font-bold text-surface-700">
                  <option value="">Toutes régions</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>

                <select value={cityId} onChange={(e) => { setCityId(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-surface-200 rounded-xl px-4 py-3 text-sm font-bold text-surface-700">
                  <option value="">Toutes villes</option>
                  {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>

                <select value={etabId} onChange={(e) => { setEtabId(e.target.value); setCurrentPage(1); }} className="bg-[#D8E9FB] border border-surface-200 rounded-xl px-4 py-3 text-sm font-bold text-surface-700">
                  <option value="">Tous établissements</option>
                  {etabs.map((et) => <option key={et.id} value={et.id}>{et.name}</option>)}
                </select>
              </div>
            </div>

            <Table
              data={demandes}
              loading={loading}
              pagination={{
                currentPage,
                totalPages: meta?.last_page || 1,
                totalItems: meta?.total || 0,
                onPageChange: setCurrentPage,
                pageSize,
              }}
              columns={[
                {
                  header: "Formateur",
                  key: "utilisateurNom",
                  render: (val, row) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-surface-900 uppercase tracking-tight">{val}</span>
                      <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{row.formateurEtablissement || "—"}</span>
                    </div>
                  ),
                },
                {
                  header: "Destination",
                  key: "villeSouhaitee",
                  render: (val, row) => (
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-surface-900 uppercase tracking-tight">{val}</span>
                      <span className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">{row.regionSouhaitee}</span>
                    </div>
                  ),
                },
                {
                  header: "Établissement",
                  key: "etablissementSouhaite",
                  render: (val) => (
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="w-3.5 h-3.5 text-surface-400" />
                      <span className="text-xs font-bold text-surface-700">{val}</span>
                    </div>
                  ),
                },
                {
                  header: "Date Soumission",
                  key: "dateDemande",
                  render: (val) => (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-surface-400" />
                      <span className="text-xs font-bold text-surface-700">{val}</span>
                    </div>
                  ),
                },
                {
                  header: "Actions",
                  key: "actions",
                  render: (_, row) => (
                    <Button variant="ghost" size="sm" onClick={() => handleViewDetail(row)} className="hover:bg-primary-50 text-primary-600 font-black">
                      <EyeIcon className="w-4 h-4 mr-2" />
                      Détails
                    </Button>
                  ),
                },
              ]}
            />

            {demandes.length === 0 && !loading && (
              <div className="p-20 text-center">
                <div className="w-20 h-20 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <InboxIcon className="w-10 h-10 text-surface-300" />
                </div>
                <h3 className="text-lg font-black text-surface-900 uppercase tracking-tight">Aucune permutation</h3>
                <p className="text-sm font-medium text-surface-500 mt-2">
                  Aucune permutation validée n'est disponible pour le moment.
                </p>
              </div>
            )}
          </Card>
        </div>

        <Modal
          isOpen={showDetailModal}
          onClose={handleCloseDetail}
          title={selectedDemande ? `Détails de la permutation #${selectedDemande.id}` : ""}
          size="xl"
        >
          {selectedDemande && (
            <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
              <DetailDemande demande={selectedDemande} />
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
};

const StatItem = ({ label, value, icon: Icon, color }) => {
  const colorStyles = {
    primary: "border-primary-100 bg-primary-50/10 text-primary-600",
    success: "border-green-100 bg-green-50/10 text-green-600",
  };

  const iconStyles = {
    primary: "bg-primary-500 text-white shadow-primary",
    success: "bg-green-500 text-white shadow-soft",
  };

  return (
    <Card className={`p-6 border-2 transition-standard ${colorStyles[color] || colorStyles.primary}`}>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-surface-400">{label}</p>
          <h3 className="text-3xl font-black tracking-tight text-surface-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl transition-standard group-hover:scale-110 ${iconStyles[color] || iconStyles.primary}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
};

export default ValidatedDemandes;
