import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { getLog } from "../../../services/logsService";
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  InformationCircleIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};

const DetailBlock = ({ label, value, mono = false }) => (
  <div className="p-4 rounded-lg border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 bg-jb-bg-main/60">
    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted mb-2">{label}</p>
    <p className={`text-sm font-bold text-jb-text-primary break-words ${mono ? "font-mono" : ""}`}>
      {formatValue(value)}
    </p>
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
  }, [id]);

  const beforeEntries = useMemo(() => Object.entries(log?.before || {}), [log?.before]);
  const afterEntries = useMemo(() => Object.entries(log?.after || {}), [log?.after]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-jb-green/20 border-t-jb-cyan animate-spin" />
            <p className="text-jb-text-secondary font-medium">Chargement du détail...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !log) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg inline-block mb-6">
            <InformationCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-jb-text-primary mb-4">Log introuvable</h1>
          <p className="text-jb-text-muted mb-8">{error || "L'entrée demandée n'existe plus."}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-jb-bg-elevated border-2 border-jb-cyan/20 text-jb-text-secondary hover:text-jb-text-primary transition-standard"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jb-text-muted">Journal des activités</p>
              <h1 className="text-2xl sm:text-3xl font-black text-jb-text-primary tracking-tight">{log.action || "Action"}</h1>
              <p className="text-jb-text-secondary">{log.table || "—"} {log.record_id ? `#${log.record_id}` : ""}</p>
            </div>
          </div>
          <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-500">
            <DocumentTextIcon className="h-8 w-8" />
          </div>
        </div>

        <Card className="p-6 sm:p-8 border-jb-green/20 max-w-none">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-jb-cyan/10 rounded-lg">
                <CodeBracketIcon className="h-6 w-6 text-jb-cyan" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-jb-text-primary uppercase tracking-wider">Détails</h2>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 bg-jb-bg-main border-jb-cyan/20 text-jb-text-muted">
              {log.type || "view"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <DetailBlock label="Log ID" value={log.id} mono />
            <DetailBlock label="User ID" value={log.user_id} mono />
            <DetailBlock label="Action" value={log.action} />
            <DetailBlock label="Table" value={log.table} />
            <DetailBlock label="Adresse IP" value={log.ip} mono />
            <DetailBlock label="ID Enregistrement" value={log.record_id} mono />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <DetailBlock label="Utilisateur" value={log.user} />
            <DetailBlock label="Email utilisateur" value={log.user_email} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <DetailBlock label="Date" value={log.date} />
            <DetailBlock label="Type" value={log.type} />
          </div>

          {(afterEntries.length > 0 || beforeEntries.length > 0) && (
            <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {afterEntries.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] mb-3">Après action</h3>
                  <div className="space-y-3">
                    {afterEntries.map(([key, value]) => (
                      <DetailBlock key={key} label={key} value={value} mono={typeof value === "object"} />
                    ))}
                  </div>
                </div>
              )}

              {beforeEntries.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] mb-3">Avant action</h3>
                  <div className="space-y-3">
                    {beforeEntries.map(([key, value]) => (
                      <DetailBlock key={key} label={key} value={value} mono={typeof value === "object"} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default LogDetail;
