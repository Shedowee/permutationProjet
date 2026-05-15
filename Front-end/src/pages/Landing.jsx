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
  LockClosedIcon,
  ShieldCheckIcon,
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
  { label: "Accès sécurisé", value: "Sanctum" },
  { label: "Rôles métiers", value: "4" },
  { label: "Suivi dossier", value: "Temps réel" },
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

  return (
    <div className="min-h-screen bg-white text-surface-900 antialiased selection:bg-primary-100 selection:text-primary-900">
      <header className="sticky top-0 z-50 border-b border-surface-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Accueil OFPPT permutation">
            <BrandLogo className="h-9 w-auto max-w-[190px]" alt="OFPPT permutation" />
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-lg">
                    Tableau de bord
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="rounded-lg">
                    Connexion
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm" className="rounded-lg">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-surface-200 bg-surface-50">
          <div className="absolute inset-0 opacity-[0.55] [background-image:linear-gradient(#dce7df_1px,transparent_1px),linear-gradient(90deg,#dce7df_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-primary-700 shadow-soft"
              >
                <ShieldCheckIcon className="h-4 w-4" />
                Portail institutionnel OFPPT
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 }}
                className="max-w-5xl text-4xl font-black leading-[1.02] tracking-tight text-surface-950 sm:text-5xl lg:text-7xl"
              >
                Plateforme de gestion des permutations OFPPT
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-6 max-w-2xl text-base font-semibold leading-8 text-surface-600 sm:text-lg"
              >
                Un espace unique pour déposer, instruire et suivre les demandes de mobilité des formateurs, avec accès par rôle, notifications et historique des décisions.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                {isAuthenticated ? (
                  <Link to={dashboardPath} className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="h-14 w-full rounded-lg px-8 sm:w-auto">
                      Ouvrir mon espace
                      <ArrowRightIcon className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="w-full sm:w-auto">
                      <Button variant="primary" size="lg" className="h-14 w-full rounded-lg px-8 sm:w-auto">
                        Accéder au portail
                        <ArrowRightIcon className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Link to="/signup" className="w-full sm:w-auto">
                      <Button variant="outline" size="lg" className="h-14 w-full rounded-lg px-8 sm:w-auto">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-3">
              {stats.map((item) => (
                <div key={item.label} className="rounded-lg border border-surface-200 bg-white/90 p-4 shadow-soft">
                  <p className="text-[11px] font-black uppercase tracking-widest text-surface-500">{item.label}</p>
                  <p className="mt-2 text-xl font-black text-surface-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
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
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.title}
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
                      <h3 className="text-base font-black text-surface-950">{step.title}</h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-surface-600">{step.description}</p>
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

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm font-semibold text-surface-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} OFPPT. Tous droits réservés.</p>
          <div className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-primary-600" />
            <span className="h-2 w-2 rounded-full bg-secondary-500" />
            <span>Gestion des permutations</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
