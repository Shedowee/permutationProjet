import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import { InformationCircleIcon, ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

const NotFoundResource = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const title = state.title || "Ressource introuvable";
  const message = state.message || "L'élément demandé n'existe plus ou a été supprimé.";
  const returnTo = state.returnTo || -1;
  const returnLabel = state.returnLabel || "Retour";

  const goBack = () => {
    if (returnTo === -1) {
      navigate(-1);
      return;
    }
    navigate(returnTo, { replace: true });
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl p-8 sm:p-10 text-center border-jb-border bg-white shadow-hard">
          <div className="mx-auto w-20 h-20 rounded-lg bg-jb-red/10 border border-jb-red/20 flex items-center justify-center mb-6">
            <InformationCircleIcon className="w-10 h-10 text-jb-red" />
          </div>

          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-jb-text-muted mb-3">
            Erreur 404
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-jb-text-primary tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-jb-text-secondary leading-relaxed max-w-xl mx-auto">
            {message}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="secondary" icon={ArrowLeftIcon} onClick={goBack}>
              {returnLabel}
            </Button>
            <Button variant="primary" icon={HomeIcon} onClick={() => navigate("/", { replace: true })}>
              Aller à l'accueil
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFoundResource;
