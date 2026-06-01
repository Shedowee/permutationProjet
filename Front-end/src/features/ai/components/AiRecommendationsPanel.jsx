import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowPathIcon,
  BoltIcon,
  CheckIcon,
  EyeIcon,
  MapPinIcon,
  ShareIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Card from "../../../shared/components/Card";
import Button from "../../../shared/components/Button";
import {
  acceptAiRecommendation,
  listAiRecommendations,
  refuseAiRecommendation,
} from "../../../services/aiRecommendationService";

const typeMeta = {
  direct: {
    label: "Direct",
    icon: BoltIcon,
    tone: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  regional: {
    label: "Régional",
    icon: MapPinIcon,
    tone: "text-sky-700 bg-sky-50 border-sky-200",
  },
  multihop: {
    label: "Multi-hop",
    icon: ShareIcon,
    tone: "text-violet-700 bg-violet-50 border-violet-200",
  },
};

const AiRecommendationsPanel = ({ role = "formateur", limit = 5 }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (role === "commission") {
        const [proposed, accepted] = await Promise.all([
          listAiRecommendations({ limit, status: "proposed" }),
          listAiRecommendations({ limit, status: "accepted" }),
        ]);
        const merged = [...proposed, ...accepted].reduce((acc, item) => {
          if (!acc.some((existing) => existing.id === item.id)) {
            acc.push(item);
          }
          return acc;
        }, []);
        setItems(merged.slice(0, limit));
      } else {
        const data = await listAiRecommendations({ limit, status: "proposed" });
        setItems(data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Impossible de charger les recommandations IA.");
    } finally {
      setLoading(false);
    }
  }, [limit, role]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const handleAction = async (recommendation, action) => {
    if (action === "open") {
      const demandeId = recommendation?.demande?.id || recommendation?.demande_permutation_id;
      if (demandeId) {
        navigate(`/commission/demandes?demande=${demandeId}`);
      }
      return;
    }

    const previous = items;
    setItems((current) => current.filter((item) => item.id !== recommendation.id));
    setMessage("");
    try {
      if (action === "accept") {
        await acceptAiRecommendation(recommendation.id);
        setMessage(
          recommendation.type === "multihop"
            ? "Votre accord a été transmis à la commission pour validation."
            : "Votre réponse a été enregistrée."
        );
      } else {
        await refuseAiRecommendation(recommendation.id);
        setMessage("La recommandation a été écartée.");
      }
    } catch (err) {
      setItems(previous);
      setError(err?.response?.data?.message || "Action impossible pour cette recommandation.");
    }
  };

  const headline = items.length
    ? `${items.length} opportunité${items.length > 1 ? "s" : ""} intelligente${items.length > 1 ? "s" : ""} trouvée${items.length > 1 ? "s" : ""}`
    : "Aucune recommandation IA active";

  return (
    <Card className="p-8 border border-white/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary-600">Moteur IA</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-jb-text-primary">{headline}</h2>
        </div>
        <Button variant="outline" size="sm" icon={ArrowPathIcon} onClick={loadRecommendations}>
          Actualiser
        </Button>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-red-500/15 bg-red-500/5 p-4 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-4 text-sm font-bold text-emerald-700">
          {message}
        </div>
      )}

      <div className="mt-7 space-y-4">
        {loading ? (
          <div className="rounded-lg border border-dashed border-jb-border bg-jb-bg-section p-8 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">Analyse des recommandations...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-jb-border bg-jb-bg-section p-8 text-center">
            <SparklesIcon className="mx-auto h-8 w-8 text-jb-text-muted" />
            <p className="mt-3 text-sm font-bold text-jb-text-muted">
              Les nouvelles demandes seront analysées automatiquement par le moteur de matching.
            </p>
          </div>
        ) : (
          items.map((item) => <RecommendationRow key={item.id} item={item} role={role} onAction={handleAction} />)
        )}
      </div>
    </Card>
  );
};

const RecommendationRow = ({ item, role, onAction }) => {
  const meta = typeMeta[item.type] || typeMeta.direct;
  const Icon = meta.icon;
  const chain = Array.isArray(item.chain) ? item.chain : [];
  const score = Number(item.score || 0);
  const statusLabel = item.status === "accepted" ? "Acceptée" : item.status === "refused" ? "Refusée" : "Proposée";
  const primaryCommissionLabel = item.type === "multihop" && item.status === "accepted" ? "Valider demande" : "Ouvrir demande";

  return (
    <div className="rounded-lg border border-jb-border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${meta.tone}`}>
              <Icon className="h-4 w-4" />
              {meta.label}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">
              Confiance {item.confidence || "medium"}
            </span>
            <span className="rounded-lg border border-jb-border bg-jb-bg-section px-3 py-1 text-[10px] font-black uppercase tracking-widest text-jb-text-muted">
              {statusLabel}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-black text-jb-text-primary">{item.title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-jb-text-secondary">{item.summary}</p>

          {chain.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chain.map((step, index) => (
                <div key={`${step.demande_id}-${index}`} className="flex items-center gap-2">
                  <span className="rounded-lg border border-jb-border bg-jb-bg-section px-3 py-2 text-xs font-black text-jb-text-primary">
                    {`${step.from || "Origine"} -> ${step.to || "Cible"}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-4 lg:w-44">
          <div className="rounded-lg border border-jb-border bg-jb-bg-section p-4 text-center">
            <p className="text-4xl font-black tracking-tight text-jb-blue">{Math.round(score)}%</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-jb-text-muted">Compatibilité</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {role === "commission" ? (
              <Button variant="primary" size="md" icon={EyeIcon} className="px-10" onClick={() => onAction(item, "open")}>
                {primaryCommissionLabel}
              </Button>
            ) : (
              <Button variant="primary" size="md" icon={CheckIcon} className="px-10" onClick={() => onAction(item, "accept")}>
                Accepter
              </Button>
            )}
            <Button variant="outline" size="md" icon={XMarkIcon} className="px-10" onClick={() => onAction(item, "refuse")}>
              {role === "commission" ? "Écarter" : "Refuser"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiRecommendationsPanel;
