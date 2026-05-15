import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import { DocumentTextIcon, ClockIcon, FunnelIcon, MagnifyingGlassIcon, ChevronUpDownIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
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
  const pageSize = 5;
  
  useEffect(() => {
    dispatch(fetchLogs({ 
      page: currentPage, 
      limit: pageSize,
      filters: {
        q: activeSearch || globalSearchTerm,
        type: filterType,
        date: filterDate
      }
    }));
  }, [dispatch, currentPage, activeSearch, globalSearchTerm, filterType, filterDate]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [activeSearch, globalSearchTerm, filterType, filterDate]);

  // Logs are already paginated and filtered on backend
  const currentLogs = useMemo(() => logs, [logs]);
  const totalPages = meta?.last_page || 1;
  const totalItems = meta?.total || 0;

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
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case LOG_ACTION_TYPES.UPDATE:
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case LOG_ACTION_TYPES.DELETE:
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case LOG_ACTION_TYPES.BLOCK:
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      case LOG_ACTION_TYPES.LOGIN:
        return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
      case LOG_ACTION_TYPES.LOGOUT:
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
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
          className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
        >
          <span>Utilisateur</span>
          {sortConfig.key === 'user' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-blue-400' : 'text-blue-400 rotate-180'}`} />
          )}
        </button>
      ),
      key: 'user',
      render: (value) => <span className="font-medium text-white">{value}</span>
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('action')}
          className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
        >
          <span>Action</span>
          {sortConfig.key === 'action' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-blue-400' : 'text-blue-400 rotate-180'}`} />
          )}
        </button>
      ),
      key: 'action',
      render: (value, row) => (
        <Link
          to={`/admin/logs/${row.id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-jb-cyan/10 text-jb-cyan border border-jb-cyan/20 hover:bg-jb-cyan/15 transition-standard"
        >
          <EyeIcon className="w-4 h-4" />
          <span>{value}</span>
        </Link>
      )
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('type')}
          className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
        >
          <span>Type</span>
          {sortConfig.key === 'type' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-blue-400' : 'text-blue-400 rotate-180'}`} />
          )}
        </button>
      ),
      key: 'type',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('date')}
          className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
        >
          <span>Date</span>
          {sortConfig.key === 'date' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-blue-400' : 'text-blue-400 rotate-180'}`} />
          )}
        </button>
      ),
      key: 'date',
      render: (value) => <span className="text-gray-300">{value}</span>
    },
    { 
      header: (
        <button 
          onClick={() => handleSort('ip')}
          className="flex items-center space-x-1 hover:text-white transition-colors duration-200"
        >
          <span>IP</span>
          {sortConfig.key === 'ip' && (
            <ChevronUpDownIcon className={`w-4 h-4 ${sortConfig.direction === 'asc' ? 'text-blue-400' : 'text-blue-400 rotate-180'}`} />
          )}
        </button>
      ),
      key: 'ip',
      render: (value) => <span className="text-gray-300 font-mono">{value}</span>
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Consultation des Logs</h1>
          <p className="text-gray-400 mt-2">Journal des activités système et des actions des utilisateurs</p>
        </div>
        
        {/* Filters and Search */}
        <Card className="p-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher par utilisateur, action ou IP..."
                  className="w-full pl-10 pr-10 py-2 bg-[#D8E9FB] border border-jb-cyan/20 rounded-lg text-jb-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-jb-text-primary"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <select
                className="w-full py-2 px-3 bg-[#D8E9FB] border border-jb-green/20 rounded-lg text-jb-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Tous les types</option>
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
                className="flex-1 py-2 px-3 bg-[#D8E9FB] border border-jb-cyan/20 rounded-lg text-jb-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <Button 
                type="submit"
                variant="primary"
                className="px-3"
                title="Rechercher"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </Button>
            </div>
          </form>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-400">
              {totalItems} {totalItems === 1 ? 'log trouvé' : 'logs trouvés'}
            </p>
          </div>
        </Card>
        
        {/* Logs Table */}
        <Card noPadding className="bg-jb-bg-section border border-jb-border rounded-lg overflow-hidden shadow-hard">
          <Table 
            columns={columns} 
            data={currentLogs} 
            isLoading={loading}
            pagination={{
              currentPage,
              totalPages,
              totalItems,
              onPageChange: setCurrentPage,
              pageSize
            }}
          />
        </Card>
        
        {/* Logs Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <ClockIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{totalItems}</p>
                <p className="text-sm text-gray-400">Total logs</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
                <DocumentTextIcon className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {logs.filter(log => log.type === LOG_ACTION_TYPES.CREATE).length}
                </p>
                <p className="text-sm text-gray-400">Créations</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <DocumentTextIcon className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">
                  {logs.filter(log => log.type === LOG_ACTION_TYPES.DELETE).length}
                </p>
                <p className="text-sm text-gray-400">Suppressions</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ViewLogs;
