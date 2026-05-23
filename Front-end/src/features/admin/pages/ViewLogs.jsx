import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import StatCard from '../../../shared/components/StatCard';
import { 
  DocumentTextIcon, 
  ClockIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  ChevronUpDownIcon, 
  XMarkIcon, 
  EyeIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { fetchLogs, selectLogs, LOG_ACTION_TYPES } from '../redux/logsSlice';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';

const ViewLogs = () => {
  const dispatch = useDispatch();
  const globalSearchTerm = useSelector(selectSearchTerm);
  const logsRaw = useSelector(selectLogs);
  const logs = useMemo(() => logsRaw || [], [logsRaw]);
  const { loading, error, meta } = useSelector(state => state.logs);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Increased page size for better view
  
  const refreshLogs = () => {
    dispatch(fetchLogs({ 
      page: currentPage, 
      limit: pageSize,
      filters: {
        q: activeSearch || globalSearchTerm,
        type: filterType,
        date: filterDate
      }
    }));
  };

  useEffect(() => {
    refreshLogs();
  }, [dispatch, currentPage, activeSearch, globalSearchTerm, filterType, filterDate]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [activeSearch, globalSearchTerm, filterType, filterDate]);

  const totalItems = meta?.total || 0;
  const totalPages = meta?.last_page || 1;

  // Reset search when input is cleared
  useEffect(() => {
    if (searchTerm === '') {
      setActiveSearch('');
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const getActionTypeColor = (type) => {
    switch (type) {
      case LOG_ACTION_TYPES.CREATE:
        return 'bg-jb-green/10 text-jb-green border-jb-green/20';
      case LOG_ACTION_TYPES.UPDATE:
        return 'bg-jb-blue/10 text-jb-blue border-jb-blue/20';
      case LOG_ACTION_TYPES.DELETE:
        return 'bg-jb-red/10 text-jb-red border-jb-red/20';
      case LOG_ACTION_TYPES.BLOCK:
        return 'bg-jb-orange/10 text-jb-orange border-jb-orange/20';
      case LOG_ACTION_TYPES.LOGIN:
        return 'bg-jb-purple/10 text-jb-purple border-jb-purple/20';
      case LOG_ACTION_TYPES.LOGOUT:
        return 'bg-jb-magenta/10 text-jb-magenta border-jb-magenta/20';
      default:
        return 'bg-jb-text-muted/10 text-jb-text-muted border-jb-text-muted/20';
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const columns = [
    { 
      header: (
        <button 
          onClick={() => handleSort('user')}
          className="flex items-center space-x-1 hover:text-jb-magenta transition-colors duration-200"
        >
          <span>Utilisateur</span>
          {sortConfig.key === 'user' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-jb-magenta' : 'text-jb-magenta rotate-180'}`} />
          )}
        </button>
      ),
      key: 'user',
      render: (value) => <span className="font-bold text-jb-text-primary uppercase tracking-tight">{value}</span>
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('action')}
          className="flex items-center space-x-1 hover:text-jb-magenta transition-colors duration-200"
        >
          <span>Action</span>
          {sortConfig.key === 'action' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-jb-magenta' : 'text-jb-magenta rotate-180'}`} />
          )}
        </button>
      ),
      key: 'action',
      render: (value, row) => (
        <Link
          to={`/admin/logs/${row.id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-jb-cyan/5 text-jb-cyan border border-jb-cyan/20 hover:bg-jb-cyan/10 transition-standard group"
        >
          <EyeIcon className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="font-semibold">{value}</span>
        </Link>
      )
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('type')}
          className="flex items-center space-x-1 hover:text-jb-magenta transition-colors duration-200"
        >
          <span>Type</span>
          {sortConfig.key === 'type' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-jb-magenta' : 'text-jb-magenta rotate-180'}`} />
          )}
        </button>
      ),
      key: 'type',
      render: (value) => (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getActionTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('date')}
          className="flex items-center space-x-1 hover:text-jb-magenta transition-colors duration-200"
        >
          <span>Date</span>
          {sortConfig.key === 'date' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-jb-magenta' : 'text-jb-magenta rotate-180'}`} />
          )}
        </button>
      ),
      key: 'date',
      render: (value) => <span className="text-jb-text-secondary font-medium">{value}</span>
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('ip')}
          className="flex items-center space-x-1 hover:text-jb-magenta transition-colors duration-200"
        >
          <span>IP</span>
          {sortConfig.key === 'ip' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-jb-magenta' : 'text-jb-magenta rotate-180'}`} />
          )}
        </button>
      ),
      key: 'ip',
      render: (value) => <span className="text-jb-text-muted font-mono text-xs">{value}</span>
    }
  ];

  return (
    <Layout>
      <div className="space-y-8 pb-12 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-2 border-jb-green/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-jb-magenta">Journalisation</p>
              <h1 className="mt-3 text-4xl font-black text-surface-900 tracking-tight uppercase">Consultation des Logs</h1>
              <p className="mt-3 text-sm font-medium text-surface-500 leading-6">
                Journal complet des activités système, des accès utilisateurs et des modifications de données.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="shrink-0 flex gap-3"
            >
              <Button 
                variant="outline"
                onClick={refreshLogs}
                icon={ArrowPathIcon}
                className={loading ? 'animate-spin' : ''}
              >
                Actualiser
              </Button>
            </motion.div>
          </div>
        </Card>
        
        {/* Filters and Search */}
        <Card className="p-6 surface-panel !border-2 !border-jb-cyan/20">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-jb-text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par utilisateur, action ou IP..."
                  className="w-full pl-10 pr-10 py-2.5 surface-input rounded-xl focus:ring-2 focus:ring-jb-magenta/20 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveSearch('');
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-jb-text-muted hover:text-jb-red transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <select
                className="w-full py-2.5 px-3 surface-input rounded-xl focus:ring-2 focus:ring-jb-magenta/20 transition-all outline-none appearance-none cursor-pointer"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous les types d'actions</option>
                {Object.values(LOG_ACTION_TYPES).map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex space-x-2">
              <input
                type="date"
                className="flex-1 py-2.5 px-3 surface-input rounded-xl focus:ring-2 focus:ring-jb-magenta/20 transition-all outline-none cursor-pointer"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <Button 
                type="submit"
                variant="primary"
                className="px-4 rounded-xl shadow-primary"
                title="Rechercher"
              >
                <FunnelIcon className="w-5 h-5" />
              </Button>
            </div>
          </form>
          
          <div className="flex justify-between items-center border-t border-jb-border pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-jb-text-muted">
              Résultats : <span className="text-jb-magenta">{totalItems}</span> {totalItems === 1 ? 'log trouvé' : 'logs trouvés'}
            </p>
            {activeSearch && (
              <span className="text-[10px] font-black uppercase tracking-widest text-jb-cyan bg-jb-cyan/5 px-2 py-1 rounded border border-jb-cyan/20">
                Filtre actif : {activeSearch}
              </span>
            )}
          </div>
        </Card>

        {/* Logs Table */}
        <div className="surface-table !border-2 !border-jb-green/10">
          <Table 
            columns={columns} 
            data={logs} 
            isLoading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage,
              pageSize
            }}
          />
        </div>
        
        {/* Logs Summary Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-jb-border"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-jb-text-muted">Indicateurs de session</p>
            <div className="h-px flex-1 bg-jb-border"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total des logs"
              value={totalItems}
              subValue="Toutes périodes confondues"
              icon={<ArchiveBoxIcon className="w-6 h-6" />}
              color="primary"
              compact
            />
            
            <StatCard
              title="Créations"
              value={logs.filter(log => log.type === LOG_ACTION_TYPES.CREATE).length}
              subValue="Sur la page actuelle"
              icon={<DocumentTextIcon className="w-6 h-6" />}
              color="success"
              compact
            />
            
            <StatCard
              title="Suppressions"
              value={logs.filter(log => log.type === LOG_ACTION_TYPES.DELETE).length}
              subValue="Sur la page actuelle"
              icon={<ExclamationTriangleIcon className="w-6 h-6" />}
              color="danger"
              compact
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewLogs;
