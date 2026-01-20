import { useState, useMemo, useEffect } from 'react';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENT_PAGE } from '../../../shared/constants/constants';
import { ClockIcon, CalendarDaysIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { listLogs } from '../../../services/logsService';
import { LOG_ACTION_TYPES as LOG_ENUM } from '../redux/logsSlice';

const ViewLogs = () => {
  const [logs, setLogs] = useState([]);
  const actionTypes = Object.values(LOG_ENUM);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(DEFAULT_CURRENT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    (async () => {
      try {
        const data = await listLogs();
        setLogs(data);
      } catch {
        setLogs([]);
      }
    })();
  }, []);

  // Filtered logs based on search and filters
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (log.ip || '').includes(searchTerm) ||
                          (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAction = !filterAction || log.action === filterAction;
      
      let matchesDate = true;
      if (dateRange.start && dateRange.end) {
        const logDate = new Date(String(log.date).replace(' ', 'T'));
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
      render: (value) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-500/30">
          {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
        </span>
      )
    },
    { 
      header: 'Date & Heure', 
      key: 'date',
      render: (value) => <span className="text-gray-300 text-sm">{value}</span>
    },
    { 
      header: 'Adresse IP', 
      key: 'ip',
      render: (value) => <span className="text-gray-400 font-mono text-sm">{value}</span>
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
                {actionTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
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
