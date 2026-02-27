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
  UserIcon
} from "@heroicons/react/24/outline";

const Landing = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col antialiased">
      {/* Institutional Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-[100]">
        <div className="h-1 bg-primary-500 w-full"></div>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center shadow-sm">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-surface-800 tracking-tighter leading-none">OFPPT</span>
              <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest mt-1">Permutations</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-bold text-secondary-700">Connexion</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary" size="sm" className="px-6">S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Institutional Hero Section */}
        <section className="relative bg-surface-50 border-b border-secondary-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center gap-16 relative z-10">
            <div className="flex-1 space-y-8 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-[0.2em]"
              >
                <CheckBadgeIcon className="w-4 h-4" />
                <span>Plateforme de Gestion des Ressources Humaines</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl md:text-6xl font-black text-surface-800 tracking-tight leading-[1.1]"
              >
                Système de <br />
                <span className="text-primary-500">Permutations Professionnelles</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-secondary-800 max-w-xl leading-relaxed font-medium"
              >
                Une solution institutionnelle dédiée aux formateurs et employés de l'OFPPT 
                pour la gestion simplifiée et transparente des demandes de mutation.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-4 pt-4"
              >
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto px-10">
                    Accéder au portail
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 border-secondary-300 text-secondary-700 hover:bg-secondary-50">
                    Créer un compte
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Visual Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex-1 relative hidden lg:block"
            >
              <div className="relative z-10 p-4">
                <Card className="bg-white border-secondary-100 shadow-2xl p-10 rounded-2xl border-t-4 border-t-primary-500">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 pb-6 border-b border-secondary-50">
                      <div className="w-12 h-12 bg-secondary-50 text-secondary-600 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="text-surface-800 font-bold">Portail Collaborateur</p>
                        <p className="text-xs text-secondary-500 font-bold uppercase tracking-widest">Session 2024</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-2 bg-secondary-50 rounded-full w-full"></div>
                      <div className="h-2 bg-secondary-50 rounded-full w-3/4"></div>
                      <div className="h-2 bg-secondary-50 rounded-full w-5/6"></div>
                    </div>
                    <div className="pt-6 flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-secondary-100 flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-secondary-400" />
                          </div>
                        ))}
                      </div>
                      <div className="h-8 w-24 bg-primary-500/10 rounded-lg"></div>
                    </div>
                  </div>
                </Card>
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-500/5 rounded-full blur-3xl"></div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Structured Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-black text-surface-800 uppercase tracking-tight">Nos Services</h2>
              <div className="w-20 h-1.5 bg-primary-500 mx-auto rounded-full"></div>
              <p className="text-secondary-600 font-medium max-w-2xl mx-auto">
                Une infrastructure numérique robuste pour accompagner la mobilité des collaborateurs de l'OFPPT.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Accessibilité",
                  desc: "Un portail accessible 24/7 pour soumettre vos demandes depuis n'importe quel établissement.",
                  icon: UserGroupIcon,
                  color: "bg-primary-50 text-primary-600"
                },
                {
                  title: "Transparence",
                  desc: "Suivez en temps réel l'état d'avancement de votre dossier et recevez des notifications à chaque étape.",
                  icon: ClipboardDocumentCheckIcon,
                  color: "bg-secondary-50 text-secondary-600"
                },
                {
                  title: "Sécurité",
                  desc: "Vos données et documents justificatifs sont protégés selon les standards de sécurité institutionnels.",
                  icon: ShieldCheckIcon,
                  color: "bg-secondary-50 text-secondary-700"
                }
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Card className="h-full border-secondary-50 hover:border-primary-500 transition-all group">
                    <div className={`w-14 h-14 ${f.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-surface-800 mb-4">{f.title}</h3>
                    <p className="text-secondary-700 font-medium leading-relaxed">
                      {f.desc}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-neutral-800 text-primary-50 py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-neutral-700 pb-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter">OFPPT</span>
            </div>
            <p className="text-secondary-100 text-sm leading-relaxed">
              Office de la Formation Professionnelle et de la Promotion du Travail. 
              Le premier opérateur public marocain en matière de formation professionnelle.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-500">Navigation</h4>
            <ul className="space-y-3 text-sm font-bold text-secondary-200">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Portail RH</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Inscription</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary-500">Contact</h4>
            <ul className="space-y-3 text-sm font-bold text-secondary-200">
              <li>Siège Social: Casablanca, Maroc</li>
              <li>Email: contact@ofppt.ma</li>
              <li>Support: support-rh@ofppt.ma</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-secondary-300 text-[10px] font-bold uppercase tracking-widest">
            © 2024 OFPPT • TOUS DROITS RÉSERVÉS
          </p>
          <div className="flex space-x-8 text-secondary-300 text-[10px] font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
