import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Layout from '../../../shared/layouts/Layout';
import Card from '../../../shared/components/Card';
import Table from '../../../shared/components/Table';
import Button from '../../../shared/components/Button';
import { DEFAULT_PAGE_SIZE, DEFAULT_CURRENT_PAGE } from '../../../shared/constants/constants';
import { ClockIcon, CalendarDaysIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { listLogs } from '../../../services/logsService';
import { LOG_ACTION_TYPES as LOG_ENUM } from '../redux/logsSlice';
import { selectSearchTerm } from '../../../shared/redux/searchSlice';

const ViewLogs = () => {
  const globalSearchTerm = useSelector(selectSearchTerm);
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const actionTypes = Object.values(LOG_ENUM);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const searchToUse = searchTerm || globalSearchTerm;
      const response = await listLogs({ 
        q: searchToUse, 
        type: filterAction, 
        page: currentPage, 
        limit: pageSize 
      });
      setLogs(response.data);
      setMeta(response.meta);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, searchTerm, globalSearchTerm, filterAction]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, globalSearchTerm, filterAction]);

  const currentLogs = useMemo(() => logs, [logs]);

  const columns = [
    { 
      header: 'Utilisateur', 
      key: 'user',
      render: (value) => <span className="font-medium text-jb-text-primary">{value}</span>
    },
    { 
      header: 'Action', 
      key: 'action',
      render: (value, row) => (
        <Link
          to={`/admin/logs/${row.id}`}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-jb-cyan/10 text-jb-cyan border border-jb-cyan/20 hover:bg-jb-cyan/15 transition-standard"
        >
          <EyeIcon className="w-4 h-4" />
          <span>{String(value).charAt(0).toUpperCase() + String(value).slice(1)}</span>
        </Link>
      )
    },
    { 
      header: 'Date & Heure', 
      key: 'date',
      render: (value) => <span className="text-jb-text-secondary text-sm">{value}</span>
    },
    { 
      header: 'Adresse IP', 
      key: 'ip',
      render: (value) => <span className="text-jb-text-muted font-mono text-sm">{value}</span>
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-jb-text-primary">Journal des Activités</h1>
          <p className="text-jb-text-secondary mt-2">Consultez les journaux d'activités du système</p>
        </div>
        
        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ClockIcon className="h-5 w-5 text-jb-text-muted" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border-0 bg-[#D8E9FB] py-2 pl-10 pr-10 text-jb-text-primary placeholder:text-jb-text-muted focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10"
                  placeholder="Rechercher par utilisateur, IP ou action..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(DEFAULT_CURRENT_PAGE); // Reset to first page on search
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(DEFAULT_CURRENT_PAGE);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-jb-text-primary"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {/* Action Filter */}
              <select
                className="rounded-lg border-0 bg-[#D8E9FB] py-2 px-3 text-jb-text-primary focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10 min-w-[180px]"
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
                    <CalendarDaysIcon className="h-5 w-5 text-jb-text-muted" />
                  </div>
                  <input
                    type="date"
                    className="block rounded-lg border-0 bg-[#D8E9FB] py-2 pl-10 pr-3 text-jb-text-primary focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10 min-w-[150px]"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ArrowsRightLeftIcon className="h-5 w-5 text-jb-text-muted" />
                  </div>
                  <input
                    type="date"
                    className="block rounded-lg border-0 bg-[#D8E9FB] py-2 pl-10 pr-3 text-jb-text-primary focus:ring-2 focus:ring-inset focus:ring-blue-500 bg-gradient-to-r from-[#D8E9FB] to-white/20 backdrop-blur-sm border border-white/10 min-w-[150px]"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Logs Table */}
        <Card noPadding className="bg-jb-bg-section border border-jb-border rounded-lg overflow-hidden shadow-hard">
          <Table 
            columns={columns} 
            data={currentLogs} 
            isLoading={isLoading}
            pagination={{
              currentPage,
              totalPages: meta?.last_page || 1,
              totalItems: meta?.total || 0,
              onPageChange: setCurrentPage,
              pageSize
            }}
          />
        </Card>
      </div>
    </Layout>
  );
};

export default ViewLogs;
