import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import { fetchFormateurStats } from '../redux/formateurSlice';


const FormateurDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(state => state.formateur.stats.data);
  const loading = useSelector(state => state.formateur.stats.loading);
  const error = useSelector(state => state.formateur.stats.error);

  useEffect(() => {
    // Dans une application réelle, vous passeriez l'ID de l'utilisateur connecté
    dispatch(fetchFormateurStats());
  }, [dispatch]);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Formateur</h1>
          <p className="text-gray-400 mt-2">Suivi de vos demandes de permutation</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-red-400">
            Erreur: {error}
          </div>
        )}

        {!loading && !error && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Demandes */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Mes Demandes</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalRequests}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
              </div>
            </Card>

            {/* En Attente */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.pendingRequests}</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </Card>

            {/* Validées */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Acceptées</p>
                  <p className="text-3xl font-bold text-green-400 mt-2">{stats.validatedRequests}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </Card>

            {/* Refusées */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Refusées</p>
                  <p className="text-3xl font-bold text-red-400 mt-2">{stats.rejectedRequests}</p>
                </div>
                <div className="bg-red-500/20 p-3 rounded-lg">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Détail de la dernière demande */}
        {!loading && !error && stats && stats.lastRequestStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Dernière Demande</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Statut:</span>
                  <span className={`font-medium ${
                    stats.lastRequestStatus === 'EN_ATTENTE' ? 'text-yellow-400' :
                    stats.lastRequestStatus === 'VALIDE' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stats.lastRequestStatus === 'EN_ATTENTE' ? 'En attente' :
                     stats.lastRequestStatus === 'VALIDE' ? 'Validée' : 'Refusée'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-white">{stats.lastRequestDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Motif:</span>
                  <span className="text-white">{stats.lastRequestMotif}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Période Demandée</h3>
              <div className="flex items-center">
                <div className="text-2xl font-bold text-blue-400">{stats.lastRequestDates}</div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Taux de Réussite</h3>
              <div className="flex items-center">
                <div className="text-4xl font-bold text-purple-400">{stats.successRate}%</div>
                <div className="ml-4 text-gray-300">
                  <p>de vos demandes sont acceptées</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FormateurDashboard;