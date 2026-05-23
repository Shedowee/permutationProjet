import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../shared/components/Button";
import BrandLogo from "../shared/components/BrandLogo";
import { useAuth } from "../auth/hooks/useAuth";
import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  DocumentTextIcon,
  LockClosedIcon,
  MapPinIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const steps = [
  {
    title: "Demande déposée",
    description: "Le formateur renseigne la destination souhaitée, le motif et les pièces utiles.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Instruction commission",
    description: "La commission consulte les dossiers, les correspondances possibles et l'historique.",
    icon: UserGroupIcon,
  },
  {
    title: "Décision tracée",
    description: "Chaque validation ou refus est notifié et conservé dans le journal d'activité.",
    icon: CheckCircleIcon,
  },
];

const stats = [
  { label: "Rôles séparés", value: "Admin, commission, formateur" },
  { label: "Cycle dossier", value: "Dépôt, étude, décision" },
  { label: "Traçabilité", value: "Notifications et journal" },
];

const roleCards = [
  {
    title: "Formateurs",
    description: "Déposer une demande, suivre son statut et consulter les décisions.",
    icon: DocumentTextIcon,
  },
  {
    title: "Commission",
    description: "Examiner les dossiers, qualifier les demandes et notifier les résultats.",
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: "Administration",
    description: "Piloter les utilisateurs, les rôles, les établissements et les logs.",
    icon: ShieldCheckIcon,
  },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  const dashboardPath =
    role === "admin"
      ? "/admin"
      : role === "commission"
        ? "/commission"
        : role === "formateur"
          ? "/formateur"
          : "/profile";

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const primaryAction = isAuthenticated
    ? { to: dashboardPath, label: "Ouvrir mon espace" }
    : { to: "/login", label: "Accéder au portail" };

  return (
    <div className="min-h-screen bg-white text-surface-900 antialiased selection:bg-primary-100 selection:text-primary-900">
      <header className="sticky top-0 z-50 border-b border-primary-900/40 bg-gradient-to-r from-primary-950 via-primary-900 to-primary-700 text-white shadow-[0_18px_48px_-34px_rgba(0,146,69,0.45)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <BrandLogo
            className="h-9 w-auto max-w-[176px] brightness-0 invert sm:max-w-[210px]"
            linkClassName="flex min-w-0 items-center gap-3"
            alt="OFPPT permutation"
          />

          <div className="flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button variant="ghost" size="sm" className="hidden rounded-lg text-white hover:bg-white/10 hover:text-white sm:inline-flex">
                    Tableau de bord
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="rounded-lg border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 hover:text-white" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-lg text-white hover:bg-white/10 hover:text-white">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="rounded-lg bg-white text-primary-800 [background-image:none] hover:bg-primary-50">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-surface-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eef7f1_48%,#edf7fb_100%)]">
          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(0,123,58,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,114,188,0.1)_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1fr_0.82fr] lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white/85 px-3 py-2 text-xs font-black uppercase tracking-widest text-primary-700 shadow-soft backdrop-blur"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Portail institutionnel OFPPT
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="max-w-4xl text-4xl font-black leading-[1.03] text-surface-950 sm:text-5xl lg:text-6xl"
              >
                Gérez les permutations OFPPT sans perdre le fil des dossiers.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-6 max-w-2xl text-base font-semibold leading-8 text-surface-600 sm:text-lg"
              >
                Un espace unique pour déposer, instruire et suivre les demandes de mobilité des formateurs avec accès par rôle, décisions historisées et notifications.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Link to={primaryAction.to} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="h-14 w-full rounded-lg px-7 sm:w-auto">
                    {primaryAction.label}
                    <ArrowRightIcon className="h-5 w-5" />
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="h-14 w-full rounded-lg px-7 sm:w-auto">
                      Créer un compte
                    </Button>
                  </Link>
                )}
              </motion.div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/70 bg-white/75 p-4 shadow-soft backdrop-blur">
                    <p className="text-[11px] font-black uppercase tracking-widest text-surface-500">{item.label}</p>
                    <p className="mt-2 text-sm font-black leading-5 text-surface-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="relative"
            >
              <div className="rounded-lg border border-white/80 bg-white/85 p-4 shadow-hard backdrop-blur-xl sm:p-5">
                <div className="flex items-center justify-between gap-4 border-b border-surface-200 pb-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
                      <SparklesIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-surface-950">Dossier permutation</p>
                      <p className="text-xs font-bold text-surface-500">Traitement en cours</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-secondary-50 px-3 py-1.5 text-xs font-black text-secondary-700">
                    Priorité
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === 1;

                    return (
                      <div
                        key={step.title}
                        className={`flex items-start gap-3 rounded-lg border p-4 ${
                          isActive
                            ? "border-primary-200 bg-primary-50"
                            : "border-surface-200 bg-surface-50"
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-primary-600 text-white" : "bg-white text-surface-600"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-surface-950">{step.title}</h3>
                          <p className="mt-1 text-xs font-semibold leading-5 text-surface-600">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-lg border border-surface-200 bg-surface-950 p-4 text-white">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-primary-300" />
                    <p className="text-sm font-black">Affectation souhaitée</p>
                  </div>
                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-bold text-white/75">
                    <span className="rounded-lg bg-white/10 px-3 py-2">Établissement actuel</span>
                    <ArrowRightIcon className="h-4 w-4" />
                    <span className="rounded-lg bg-white/10 px-3 py-2">Nouvelle destination</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-white py-14 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-primary-700">Parcours dossier</p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-surface-950 sm:text-4xl">
                Une chaîne de traitement claire pour chaque rôle.
              </h2>
              <p className="mt-5 text-sm font-semibold leading-7 text-surface-600">
                La page d'accueil dirige rapidement les utilisateurs vers leur espace. Le travail opérationnel reste dans les tableaux de bord admin, commission et formateur.
              </p>
            </div>

            <div className="grid gap-4">
              {roleCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                    className="flex gap-4 rounded-lg border border-surface-200 bg-surface-50 p-5"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-surface-950">{card.title}</h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-surface-600">{card.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-y border-surface-200 bg-surface-950 py-14 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            <div className="flex gap-4">
              <BuildingOffice2Icon className="h-7 w-7 shrink-0 text-primary-300" />
              <div>
                <h3 className="font-black">Référentiel établissements</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">Régions, villes et établissements structurés pour les demandes.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <ClockIcon className="h-7 w-7 shrink-0 text-primary-300" />
              <div>
                <h3 className="font-black">Suivi continu</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">Notifications et états de traitement visibles depuis le compte.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <LockClosedIcon className="h-7 w-7 shrink-0 text-primary-300" />
              <div>
                <h3 className="font-black">Accès contrôlé</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/65">Permissions séparées pour administration, commission et formateurs.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-primary-900/40 bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800 py-8 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 text-sm font-semibold text-primary-100 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 shadow-[0_18px_34px_-20px_rgba(0,0,0,0.35)] ring-1 ring-inset ring-white/20">
                <ShieldCheckIcon className="h-5 w-5 text-primary-300" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">OFPPT</span>
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed text-primary-100">
              Gestion des permutations professionnelles.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <p className="text-sm font-bold text-primary-100">© {new Date().getFullYear()} OFPPT. Tous droits réservés.</p>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-primary-300" />
              <span className="h-2 w-2 rounded-full bg-secondary-300" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Gestion des permutations</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
