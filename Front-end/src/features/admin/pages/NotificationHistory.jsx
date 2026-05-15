import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../../shared/layouts/Layout";
import Card from "../../../shared/components/Card";
import Table from "../../../shared/components/Table";
import { getNotifications } from "../../../services/userService";
import { formatDate } from "../../../shared/utils/dateUtils";
import {
  BellIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

const NotificationHistory = () => {
  const [notifications, setNotifications] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(currentPage, filter);
      const items = response?.data ?? [];

      const mapped = items
        .map((item) => ({
          id: item.id,
          title: item.payload?.title || item.title || "Notification",
          message: item.payload?.message || item.message || "",
          type: item.type || "info",
          read_at: item.read_at || null,
          created_at: item.created_at || null,
          route: item.payload?.route || null,
          target_role: item.payload?.target_role || null,
          payload: item.payload || {},
        }))
        ;

      setNotifications(mapped);
      setMeta(response?.meta || null);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [currentPage, filter]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [filter]);

  const columns = [
    {
      header: "Date",
      key: "created_at",
      render: (val) => (
        <div className="flex flex-col">
          <span className="text-jb-text-primary font-medium">{val ? formatDate(val) : "—"}</span>
          <span className="text-xs text-jb-text-secondary">
            {val ? new Date(val).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Titre",
      key: "title",
      render: (val) => <span className="font-bold text-jb-cyan">{val}</span>,
    },
    {
      header: "Message",
      key: "message",
      render: (val) => <span className="text-sm text-jb-text-secondary line-clamp-2">{val}</span>,
    },
    {
      header: "Type",
      key: "type",
      render: (val) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            val === "demande"
              ? "bg-primary-500/10 text-primary-500 border border-primary-500/20"
              : val === "system"
                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                : "bg-jb-bg-elevated text-jb-text-secondary border border-jb-border"
          }`}
        >
          {val}
        </span>
      ),
    },
    {
      header: "Portée",
      key: "target_role",
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
          val ? "bg-jb-cyan/10 text-jb-cyan border border-jb-cyan/20" : "bg-jb-bg-elevated text-jb-text-secondary border border-jb-border"
        }`}>
          {val || "personnelle"}
        </span>
      ),
    },
    {
      header: "Statut",
      key: "read_at",
      render: (val) => (
        <div className={`flex items-center ${val ? "text-accent-500" : "text-primary-500"}`}>
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          <span className="text-[10px] font-bold uppercase">{val ? "Lu" : "Non lu"}</span>
        </div>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      render: (_, row) => (
        <Link
          to={`/admin/notifications/${row.id}`}
          className="p-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 border border-primary-500/20 transition-all inline-block"
        >
          <EyeIcon className="w-4 h-4" />
        </Link>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-600/10 rounded-lg border border-primary-500/20 shadow-[0_18px_34px_-20px_rgba(47,123,229,0.2)]">
              <BellIcon className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
              <p className="text-jb-text-secondary mt-1 font-medium text-lg">Vos notifications système et d&apos;actions</p>
            </div>
          </div>
          <button
            onClick={loadNotifications}
            className="flex items-center space-x-2 px-6 py-3 bg-jb-bg-elevated hover:bg-jb-bg-main text-jb-text-primary rounded-lg border border-jb-border transition-all shadow-[0_24px_50px_-28px_rgba(15,23,42,0.22)] font-bold uppercase tracking-widest text-xs"
          >
            <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualiser</span>
          </button>
        </div>

        <Card noPadding className="bg-jb-bg-section border-2 border-jb-green/20 ring-1 ring-inset ring-jb-cyan/10 rounded-lg overflow-hidden shadow-hard">
          <div className="p-6 pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div className="relative flex-1 max-w-md">
                <FunnelIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-jb-text-muted" />
                <input
                  type="text"
                  placeholder="Filtrer les notifications..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-jb-bg-main border-2 border-jb-cyan/20 rounded-lg text-jb-text-primary focus:ring-2 focus:ring-jb-green/15 outline-none transition-all placeholder:text-jb-text-muted"
                />
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-jb-text-muted uppercase tracking-widest">
                <span className="text-accent-500">{meta?.total || 0}</span>
                <span>Entrées trouvées</span>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            data={notifications}
            loading={loading}
            pagination={{
              currentPage,
              totalPages: meta?.last_page || 1,
              totalItems: meta?.total || 0,
              onPageChange: setCurrentPage,
              pageSize,
            }}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default NotificationHistory;
