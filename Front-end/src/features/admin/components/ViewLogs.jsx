import React, { useState, useMemo } from 'react';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import { LOG_ACTION_TYPES, DEFAULT_PAGE_SIZE, DEFAULT_CURRENT_PAGE } from '../../../shared/constants/constants';
import { ClockIcon, FunnelIcon, CalendarDaysIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const ViewLogs = () => {
  // Mock logs data
  const [logs] = useState([
    { id: 1, user: 'Ahmed Mohamed', action: 'login', timestamp: '2024-01-15 10:30:00', ip: '192.168.1.100', details: 'Connexion réussie' },
    { id: 2, user: 'Fatima Karim', action: 'create_account', timestamp: '2024-01-15 09:15:00', ip: '192.168.1.101', details: 'Création du compte utilisateur ID: 123' },
    { id: 3, user: 'Youssef Tahiri', action: 'assign_role', timestamp: '2024-01-15 08:45:00', ip: '192.168.1.102', details: 'Attribution du rôle admin à utilisateur ID: 456' },
    { id: 4, user: 'Sara Laaroussi', action: 'block_user', timestamp: '2024-01-14 16:20:00', ip: '192.168.1.103', details: 'Blocage de l\'utilisateur ID: 789' },
    { id: 5, user: 'Omar Benali', action: 'update_profile', timestamp: '2024-01-14 15:30:00', ip: '192.168.1.104', details: 'Mise à jour des informations personnelles' },
    { id: 6, user: 'Layla Fassi', action: 'logout', timestamp: '2024-01-14 14:45:00', ip: '192.168.1.105', details: 'Déconnexion de la session' },
    { id: 7, user: 'Karim Ouali', action: 'delete_user', timestamp: '2024-01-14 13:20:00', ip: '192.168.1.106', details: 'Suppression de l\'utilisateur ID: 101' },
    { id: 8, user: 'Nadia Chraibi', action: 'login', timestamp: '2024-01-14 12:15:00', ip: '192.168.1.107', details: 'Connexion réussie' },
    { id: 9, user: 'Ahmed Mohamed', action: 'update_profile', timestamp: '2024-01-13 11:30:00', ip: '192.168.1.100', details: 'Mise à jour des permissions' },
    { id: 10, user: 'Fatima Karim', action: 'create_account', timestamp: '2024-01-13 10:45:00', ip: '192.168.1.101', details: 'Création du compte utilisateur ID: 202' },
    { id: 11, user: 'Youssef Tahiri', action: 'login', timestamp: '2024-01-13 09:20:00', ip: '192.168.1.102', details: 'Connexion réussie' },
    { id: 12, user: 'Sara Laaroussi', action: 'assign_role', timestamp: '2024-01-12 08:15:00', ip: '192.168.1.103', details: 'Attribution du rôle modérateur à utilisateur ID: 303' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  // Filtered logs based on search and filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.ip.includes(searchTerm) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = !filterAction || log.action === filterAction;
      
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const logDate = new Date(log.timestamp.replace(' ', 'T'));
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        matchesDate = logDate >= startDate && logDate <= endDate;
      }
      
      return matchesSearch && matchesAction && matchesDate;
    });
  }, [logs, searchTerm, filterAction, dateRange]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredLogs.slice(startIndex, startIndex + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Page navigation
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const columns = [
    { 
      header: 'Utilisateur', 
      key: 'user',
      render: (value) => <span className="font-medium text-white">{value}</span>
    },
    { 
      header: 'Action', 
      key: 'action',
      render: (value) => {
        const actionType = LOG_ACTION_TYPES.find(a => a.value === value);
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${actionType?.color}/20 text-${actionType?.color.split('-')[1]}-400 border border-${actionType?.color.split('-')[1]}-500/30`}>
            {actionType?.label || value}
          </span>
        );
      }
    },
    { 
      header: 'Date & Heure', 
      key: 'timestamp',
      render: (value) => <span className="text-gray-300 text-sm">{value}</span>
    },
    { 
      header: 'Adresse IP', 
      key: 'ip',
      render: (value) => <span className="text-gray-400 font-mono text-sm">{value}</span>
    },
    { 
      header: 'Détails', 
      key: 'details',
      render: (value) => <span className="text-gray-300 text-sm max-w-xs truncate" title={value}>{value}</span>
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Journal des Activités</h1>
          <p className="text-gray-400 mt-2">Consultez les journaux d'activités du système</p>
        </div>
        
        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-0 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10"
                  placeholder="Rechercher dans les journaux..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset to first page on search
                  }}
                />
              </div>
              
              {/* Action Filter */}
              <select
                className="rounded-lg border-0 bg-white/5 py-2 px-3 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 min-w-[180px]"
                value={filterAction}
                onChange={(e) => {
                  setFilterAction(e.target.value);
                  setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset to first page on filter
                }}
              >
                <option value="">Toutes les actions</option>
                {LOG_ACTION_TYPES.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
              
              {/* Date Range */}
              <div className="flex gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="block rounded-lg border-0 bg-white/5 py-2 pl-10 pr-3 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 min-w-[150px]"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowsRightLeftIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="block rounded-lg border-0 bg-white/5 py-2 pl-10 pr-3 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 min-w-[150px]"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Logs Table */}
        <Card className="p-6">
          <Table 
            data={paginatedLogs}
            columns={columns}
            striped={true}
            caption={`${filteredLogs.length} entr${filteredLogs.length !== 1 ? 'ies' : 'ée'} trouv${filteredLogs.length !== 1 ? 'ées' : 'ée'} | Page ${currentPage} sur ${totalPages}`}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-400">
                Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, filteredLogs.length)} sur {filteredLogs.length} entrées
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset to first page when changing page size
                  }}
                  className="rounded-lg border-0 bg-white/5 py-1 px-3 text-white focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-white/5 to-white/3 backdrop-blur-sm border border-white/10 text-sm"
                >
                  <option value={5}>5/page</option>
                  <option value={10}>10/page</option>
                  <option value={25}>25/page</option>
                  <option value={50}>50/page</option>
                </select>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button 
                        key={pageNum}
                        variant={currentPage === pageNum ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className="min-w-[36px]"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && currentPage > 3 && <span className="text-gray-500">...</span>}
                  {totalPages > 5 && currentPage > 3 && currentPage < totalPages - 2 && (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => goToPage(currentPage)}
                      className="min-w-[36px]"
                    >
                      {currentPage}
                    </Button>
                  )}
                  {totalPages > 5 && currentPage < totalPages - 2 && <span className="text-gray-500">...</span>}
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      className="min-w-[36px]"
                    >
                      {totalPages}
                    </Button>
                  )}
                </div>
                
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default ViewLogs;
