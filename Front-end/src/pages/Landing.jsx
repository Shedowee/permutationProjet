import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../shared/components/Button";
import Card from "../shared/components/Card";
import { 
  ShieldCheckIcon, 
  UserGroupIcon, 
  ClipboardDocumentCheckIcon, 
  ArrowRightIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  UserIcon,
  GlobeAltIcon,
  LockClosedIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const Landing = () => {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col antialiased selection:bg-primary-100 selection:text-primary-900">
      {/* Header */}
      <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-xl border-b border-surface-100 shadow-soft">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-11 h-11 bg-primary-500 rounded-xl flex items-center justify-center shadow-primary group-hover:scale-105 transition-standard">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-surface-900 tracking-tight leading-none">OFPPT</span>
              <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1">Permutations</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Connexion</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm" className="shadow-primary px-8">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-200 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-200 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-20">
              <div className="flex-1 text-center lg:text-left space-y-10">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-soft border border-surface-100 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em]"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Nouvelle Plateforme de Mobilité</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-surface-900 tracking-tighter leading-[0.95]"
                >
                  Gérez vos <br />
                  <span className="text-primary-500">permutations</span> <br />
                  en toute simplicité.
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg md:text-xl text-surface-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-bold"
                >
                  Le portail institutionnel dédié aux formateurs et employés de l'OFPPT 
                  pour une mobilité fluide, transparente et sécurisée.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 pt-4"
                >
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto px-12 h-16 shadow-primary">
                      Accéder au portail
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/signup" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-12 h-16">
                      Créer un compte
                    </Button>
                  </Link>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center lg:justify-start gap-10 pt-10 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-standard"
                >
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-black text-surface-900">24/7</span>
                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Disponibilité</span>
                  </div>
                  <div className="w-px h-10 bg-surface-200"></div>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-black text-surface-900">100%</span>
                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Digitalisé</span>
                  </div>
                  <div className="w-px h-10 bg-surface-200"></div>
                  <div className="flex flex-col items-center lg:items-start">
                    <span className="text-2xl font-black text-surface-900">OFPPT</span>
                    <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Institutionnel</span>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="flex-1 relative hidden lg:block"
              >
                <div className="relative z-10">
                  <Card hover={false} className="p-0 overflow-hidden shadow-hard border-surface-100 bg-white">
                    <div className="bg-primary-500 p-8 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                          <AcademicCapIcon className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-white font-black">Espace Formateur</p>
                          <p className="text-[10px] text-primary-100 font-bold uppercase tracking-widest">Tableau de bord</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                        <CheckBadgeIcon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="p-10 space-y-8">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Progression du dossier</span>
                          <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">75%</span>
                        </div>
                        <div className="w-full bg-surface-50 h-3 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ duration: 1.5, delay: 1 }}
                            className="bg-primary-500 h-full rounded-full shadow-primary"
                          ></motion.div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                          <div className="w-8 h-8 bg-secondary-100 rounded-xl flex items-center justify-center text-secondary-600 mb-3">
                            <ClipboardDocumentCheckIcon className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-black text-surface-900 uppercase tracking-tight">Demandes</p>
                          <p className="text-lg font-black text-secondary-600 mt-1">12</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-surface-50 border border-surface-100">
                          <div className="w-8 h-8 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 mb-3">
                            <UserGroupIcon className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-black text-surface-900 uppercase tracking-tight">Partenaires</p>
                          <p className="text-lg font-black text-primary-600 mt-1">08</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Floating elements */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-10 -right-10 p-6 bg-white rounded-3xl shadow-hard border border-surface-100 flex items-center gap-4 z-20"
                  >
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                      <CheckBadgeIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-surface-900 uppercase tracking-widest">Dossier Validé</p>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -bottom-10 -left-10 p-6 bg-white rounded-3xl shadow-hard border border-surface-100 flex items-center gap-4 z-20"
                  >
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                      <GlobeAltIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black text-surface-900 uppercase tracking-widest">Mobilité Nationale</p>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-32 bg-white relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-24 space-y-6">
              <h2 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em]">Fonctionnalités Clés</h2>
              <h3 className="text-4xl md:text-5xl font-black text-surface-900 tracking-tight">Pourquoi choisir notre portail ?</h3>
              <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  title: "Simplicité",
                  desc: "Soumettez vos demandes en quelques clics grâce à un processus digitalisé de bout en bout.",
                  icon: SparklesIcon,
                  color: "bg-primary-50 text-primary-600"
                },
                {
                  title: "Transparence",
                  desc: "Suivez chaque étape de validation en temps réel avec un historique complet des actions.",
                  icon: GlobeAltIcon,
                  color: "bg-secondary-50 text-secondary-600"
                },
                {
                  title: "Sécurité",
                  desc: "Vos informations personnelles et professionnelles sont protégées par les plus hauts standards de sécurité.",
                  icon: LockClosedIcon,
                  color: "bg-accent-50 text-accent-600"
                }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full group">
                    <div className={`w-16 h-16 ${f.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-standard shadow-sm`}>
                      <f.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-surface-900 mb-4">{f.title}</h4>
                    <p className="text-surface-500 font-bold leading-relaxed">
                      {f.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-surface-900 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary-500 rounded-full blur-[120px]"></div>
          </div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10 space-y-12">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">
              Prêt à commencer votre <br />
              <span className="text-primary-400">nouvelle étape</span> ?
            </h2>
            <p className="text-white/60 text-lg md:text-xl font-bold max-w-2xl mx-auto">
              Rejoignez des milliers de collaborateurs OFPPT qui utilisent déjà notre portail pour leur mobilité professionnelle.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto px-16 h-16 shadow-primary">
                  Créer un compte maintenant
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto px-16 h-16 text-white hover:bg-white/10">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-surface-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-primary">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black text-surface-900 tracking-tight leading-none">OFPPT</span>
              </div>
              <p className="text-sm font-bold text-surface-500 leading-relaxed uppercase tracking-widest text-[10px]">
                Office de la Formation Professionnelle et de la Promotion du Travail.
              </p>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.2em]">Plateforme</h5>
              <ul className="space-y-4">
                <li><Link to="/login" className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-standard">Connexion</Link></li>
                <li><Link to="/signup" className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-standard">Inscription</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.2em]">Ressources</h5>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-standard">Centre d'aide</a></li>
                <li><a href="#" className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-standard">Guide Utilisateur</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="text-[10px] font-black text-surface-900 uppercase tracking-[0.2em]">Légal</h5>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-standard">Confidentialité</a></li>
                <li><a href="#" className="text-sm font-bold text-surface-500 hover:text-primary-600 transition-standard">Conditions d'utilisation</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-surface-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
              © {new Date().getFullYear()} OFPPT • Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              <div className="w-2 h-2 rounded-full bg-primary-500"></div>
              <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
              <div className="w-2 h-2 rounded-full bg-accent-500"></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
