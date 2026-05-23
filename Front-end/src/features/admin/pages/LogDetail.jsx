import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { getLog } from "../../../services/logsService";
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CodeBracketIcon,
  ClockIcon,
  IdentificationIcon,
  ComputerDesktopIcon,
  TableCellsIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return <pre className="text-[10px] bg-jb-bg-elevated/50 p-3 rounded-lg overflow-x-auto border border-jb-border/50 font-mono text-jb-text-primary">{JSON.stringify(value, null, 2)}</pre>;
  }

  return String(value);
};

const DetailItem = ({ label, value, icon: Icon, mono = false, fullWidth = false }) => (
  <div className={`group flex flex-col gap-1.5 ${fullWidth ? 'col-span-full' : ''}`}>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-jb-magenta/60 group-hover:text-jb-magenta transition-colors" />}
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-jb-text-muted">{label}</span>
    </div>
    <div className={`text-sm font-bold text-jb-text-primary px-3 py-2 rounded-xl bg-jb-bg-section/40 border border-jb-border/30 group-hover:border-jb-magenta/20 transition-all ${mono ? 'font-mono text-xs' : ''}`}>
      {formatValue(value)}
    </div>
  </div>
);

const LogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLog = async () => {
      try {
        setLoading(true);
        const response = await getLog(id);
        setLog(response || null);
      } catch (err) {
        if (err?.response?.status === 404) {
          navigate("/not-found", {
            replace: true,
            state: {
              title: "Log introuvable",
              message: "Cette entrée du journal a été supprimée ou n'existe plus.",
              returnTo: "/admin/logs",
              returnLabel: "Retour aux logs",
            },
          });
          return;
        }
        setError(err?.response?.data?.message || "Impossible de charger le détail du log.");
      } finally {
        setLoading(false);
      }
    };

    loadLog();
  }, [id, navigate]);

  const beforeEntries = useMemo(() => Object.entries(log?.before || {}), [log?.before]);
  const afterEntries = useMemo(() => Object.entries(log?.after || {}), [log?.after]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-jb-green/20 border-t-jb-magenta animate-spin" />
            <p className="text-jb-text-secondary font-black uppercase tracking-widest text-xs">Chargement du détail...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !log) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="p-6 bg-jb-red/10 border-2 border-jb-red/20 rounded-2xl inline-block mb-6 shadow-hard">
            <InformationCircleIcon className="h-12 w-12 text-jb-red" />
          </div>
          <h1 className="text-3xl font-black text-jb-text-primary mb-4 uppercase tracking-tight">Log introuvable</h1>
          <p className="text-jb-text-muted font-medium mb-8">{error || "L'entrée demandée n'existe plus."}</p>
          <Button variant="outline" onClick={() => navigate(-1)} icon={ArrowLeftIcon}>Retourner au journal</Button>
        </div>
      </Layout>
    );
  }

  const getActionTypeColor = (type) => {
    const t = String(type).toLowerCase();
    if (t.includes('login') || t.includes('connexion')) return 'bg-jb-purple/10 text-jb-purple border-jb-purple/20';
    if (t.includes('create') || t.includes('création')) return 'bg-jb-green/10 text-jb-green border-jb-green/20';
    if (t.includes('delete') || t.includes('suppression')) return 'bg-jb-red/10 text-jb-red border-jb-red/20';
    return 'bg-jb-cyan/10 text-jb-cyan border-jb-cyan/20';
  };

  return (
    <Layout>
      <div className="max-w-[1200px] mx-auto space-y-6 pb-12">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="group p-2.5 rounded-xl bg-white border border-jb-border text-jb-text-secondary hover:text-jb-magenta hover:border-jb-magenta/30 transition-all shadow-sm"
            title="Retour"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jb-magenta">Journal d'activité</p>
            <h1 className="text-2xl font-black text-surface-900 tracking-tight uppercase">Détails de l'action</h1>
          </div>
        </div>

        <Card className="p-0 border-2 border-jb-green/10 shadow-hard overflow-hidden">
          {/* Header Section Inside Card */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-jb-bg-section to-white border-b border-jb-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 rounded-2xl bg-jb-magenta/5 border-2 border-jb-magenta/10 text-jb-magenta shadow-inner">
                  <DocumentTextIcon className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-jb-text-primary tracking-tight uppercase leading-none">{log.action || "Action"}</h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getActionTypeColor(log.type)}`}>
                      {log.type || "view"}
                    </span>
                    <span className="text-[11px] font-bold text-jb-text-muted flex items-center gap-1.5">
                      <TableCellsIcon className="w-3.5 h-3.5" />
                      {log.table || "Système"} {log.record_id ? `• ID #${log.record_id}` : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-widest">Date de l'action</p>
                <div className="flex items-center gap-2 text-jb-text-primary">
                  <ClockIcon className="w-4 h-4 text-jb-magenta" />
                  <span className="text-sm font-black">{log.date}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Body Section */}
          <div className="p-6 sm:p-8 space-y-10">
            {/* Metadata Grid */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Square3Stack3DIcon className="w-4 h-4 text-jb-magenta" />
                <h3 className="text-xs font-black text-jb-text-primary uppercase tracking-[0.2em]">Métadonnées techniques</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DetailItem label="Log ID" value={log.id} icon={IdentificationIcon} mono />
                <DetailItem label="ID Enregistrement" value={log.record_id} icon={CodeBracketIcon} mono />
                <DetailItem label="Adresse IP" value={log.ip} icon={ComputerDesktopIcon} mono />
                <DetailItem label="Source" value={log.table ? "Base de données" : "Système"} icon={TableCellsIcon} />
              </div>
            </section>

            {/* User Info */}
            <section className="p-6 rounded-2xl bg-jb-bg-section/50 border border-jb-border/50">
              <div className="flex items-center gap-3 mb-6">
                <UserIcon className="w-4 h-4 text-jb-magenta" />
                <h3 className="text-xs font-black text-jb-text-primary uppercase tracking-[0.2em]">Auteur de l'action</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailItem label="Nom complet" value={log.user} icon={UserIcon} />
                <DetailItem label="Adresse Email" value={log.user_email} icon={EnvelopeIcon} />
              </div>
            </section>

            {/* State Changes */}
            {(afterEntries.length > 0 || beforeEntries.length > 0) && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <ArrowPathIcon className="w-4 h-4 text-jb-magenta" />
                  <h3 className="text-xs font-black text-jb-text-primary uppercase tracking-[0.2em]">Modifications de l'état</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {beforeEntries.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-jb-orange/5 border border-jb-orange/20 w-fit">
                        <ArrowLeftIcon className="w-3.5 h-3.5 text-jb-orange" />
                        <span className="text-[9px] font-black text-jb-orange uppercase tracking-widest">Avant action</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {beforeEntries.map(([key, value]) => (
                          <DetailItem key={key} label={key} value={value} mono={typeof value === "object"} />
                        ))}
                      </div>
                    </div>
                  )}

                  {afterEntries.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-jb-blue/5 border border-jb-blue/20 w-fit">
                        <ArrowPathIcon className="w-3.5 h-3.5 text-jb-blue" />
                        <span className="text-[9px] font-black text-jb-blue uppercase tracking-widest">Après action</span>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {afterEntries.map(([key, value]) => (
                          <DetailItem key={key} label={key} value={value} mono={typeof value === "object"} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-8 py-4 bg-jb-bg-section/30 border-t border-jb-border/50 flex justify-between items-center">
            <p className="text-[9px] font-bold text-jb-text-muted italic uppercase tracking-widest">
              Généré automatiquement par le module d'audit système
            </p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-jb-green animate-pulse" />
              <span className="text-[9px] font-black text-jb-text-muted uppercase tracking-widest text-jb-green/80">Log vérifié</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default LogDetail;
