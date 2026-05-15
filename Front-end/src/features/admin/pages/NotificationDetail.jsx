import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import { getNotification, markNotificationRead } from "../../../services/userService";
import {
  BellIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

const NotificationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        setLoading(true);
        const response = await getNotification(id);
        const item = response?.data || null;
        setNotification(item);

        if (item && !item.read_at) {
          await markNotificationRead(id);
        }
      } catch (err) {
        const status = err?.response?.status;
        if (status === 404) {
          navigate("/not-found", {
            replace: true,
            state: {
              title: "Notification introuvable",
              message: "Cette notification a peut-être été supprimée ou n'existe plus.",
              returnTo: "/admin/notifications",
              returnLabel: "Retour aux notifications",
            },
          });
          return;
        }
        setError(err?.response?.data?.message || "Impossible de charger les détails de la notification.");
      } finally {
        setLoading(false);
      }
    };

    loadNotification();
  }, [id]);

  const payload = notification?.payload || {};
  const title = payload.title || "Notification";
  const message = payload.message || "";
  const type = notification?.type || "info";
  const createdAt = notification?.created_at || null;
  const isRead = !!notification?.read_at;
  const route = payload.route || null;
  const targetRole = payload.target_role || null;

  const details = useMemo(() => {
    const entries = Object.entries(payload).filter(([key]) => !["title", "message", "route", "target_role"].includes(key));
    return entries;
  }, [payload]);

  const actionDetails = useMemo(() => {
    const preferredKeys = [
      "action",
      "type",
      "entity",
      "entity_type",
      "entity_id",
      "reference",
      "status",
      "context",
    ];

    const labels = {
      action: "Action",
      type: "Catégorie",
      entity: "Cible",
      entity_type: "Type de cible",
      entity_id: "Identifiant",
      reference: "Référence",
      status: "Statut",
      context: "Contexte",
      route: "Route",
      target_role: "Portée",
    };

    const normalized = preferredKeys
      .map((key) => [key, payload?.[key]])
      .filter(([, value]) => value !== undefined && value !== null && value !== "");

    if (route) {
      normalized.push(["route", route]);
    }

    if (targetRole) {
      normalized.push(["target_role", targetRole]);
    }

    return normalized.map(([key, value]) => ({
      key,
      label: labels[key] || key,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
    }));
  }, [payload, route, targetRole]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-jb-text-secondary">Chargement des détails...</p>
        </div>
      </Layout>
    );
  }

  if (error || !notification) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg inline-block mb-6">
            <InformationCircleIcon className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-jb-text-primary mb-4">Erreur</h1>
          <p className="text-jb-text-secondary mb-8">{error || "Notification introuvable."}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>Retour</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-jb-bg-elevated border border-jb-border text-jb-text-muted hover:text-jb-text-primary transition-all"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jb-text-muted">Notification</p>
              <h1 className="text-2xl sm:text-3xl font-black text-jb-text-primary tracking-tight">{title}</h1>
              <p className="text-jb-text-secondary">{message}</p>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${
            type === "demande" ? "bg-primary-500/10 border-primary-500/20 text-primary-500" :
            type === "system" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
            "bg-jb-bg-elevated border-jb-border text-jb-text-muted"
          }`}>
            <BellIcon className="h-8 w-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.9fr] gap-6">
          <div className="space-y-6">
            <Card className="p-6 border-jb-green/20 bg-jb-bg-section">
              <div className="flex items-center justify-between gap-4 mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600/10 rounded-lg">
                    <InformationCircleIcon className="h-6 w-6 text-blue-500" />
                  </div>
              <h2 className="text-lg sm:text-xl font-black text-jb-text-primary uppercase tracking-wider">Contenu</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  isRead ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                }`}>
                  {isRead ? "Lu" : "Non lu"}
                </span>
              </div>

              <div className="p-5 bg-jb-bg-main/70 rounded-lg border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-jb-text-muted">Message</p>
                <p className="text-xl sm:text-2xl font-black text-jb-text-primary leading-tight">{message || "—"}</p>
              </div>

              {actionDetails.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] ml-1">Action liée</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {actionDetails.map((item) => (
                      <div key={item.key} className="p-4 bg-jb-bg-main rounded-lg border-2 border-jb-cyan/20 ring-1 ring-inset ring-jb-green/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted mb-1">{item.label}</p>
                        <p className="text-sm font-bold text-jb-text-primary break-words">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {details.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.2em] ml-1">Détails techniques</h3>
                  <div className="space-y-3">
                    {details.map(([key, value]) => (
                      <div key={key} className="p-4 bg-jb-bg-main rounded-lg border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted mb-1">{key}</p>
                        <p className="text-sm font-bold text-jb-text-primary break-words">
                          {typeof value === "object" ? JSON.stringify(value) : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {route && (
                <div className="mt-6">
                  <Button
                    variant="primary"
                    onClick={() => navigate(route)}
                    icon={ArrowTopRightOnSquareIcon}
                  >
                    Ouvrir l&apos;action
                  </Button>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 border-jb-cyan/20 bg-jb-bg-section">
              <h2 className="text-sm font-black text-jb-text-primary mb-4 uppercase tracking-widest border-b-2 border-jb-cyan/15 pb-3">Contexte</h2>
              <div className="space-y-4">
                <ContextItem
                  icon={<UserIcon className="h-5 w-5" />}
                  label="Utilisateur"
                  value={notification.user?.name || "—"}
                  subValue={notification.user?.email || "—"}
                  color="text-jb-text-primary"
                />
                <ContextItem
                  icon={<ClockIcon className="h-5 w-5" />}
                  label="Date & Heure"
                  value={createdAt ? new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : "—"}
                  subValue={createdAt ? new Date(createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "—"}
                  color="text-jb-text-primary"
                />
                <ContextItem
                  icon={<GlobeAltIcon className="h-5 w-5" />}
                  label="Type"
                  value={type.toUpperCase()}
                  color="text-jb-text-primary"
                />
                <ContextItem
                  icon={<ShieldCheckIcon className="h-5 w-5" />}
                  label="Portée"
                  value={targetRole || "Personnelle"}
                  color="text-jb-text-primary"
                />
                <ContextItem
                  icon={<CheckCircleIcon className="h-5 w-5" />}
                  label="Statut"
                  value={isRead ? "Lu" : "Non lu"}
                  color={isRead ? "text-emerald-500" : "text-amber-500"}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

const ContextItem = ({ icon, label, value, subValue, color = "text-jb-text-primary" }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1 p-2 bg-jb-bg-main rounded-xl text-jb-text-muted border-2 border-jb-green/20 shrink-0">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-jb-text-muted uppercase tracking-[0.25em] mb-1">{label}</p>
      <p className={`text-sm sm:text-base font-black tracking-tight truncate ${color}`}>{value}</p>
      {subValue && <p className="text-xs font-semibold text-jb-text-secondary mt-0.5 truncate">{subValue}</p>}
    </div>
  </div>
);

export default NotificationDetail;
