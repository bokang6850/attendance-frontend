import { useEffect, useState } from 'react';
import axios from 'axios';
import './AttendanceDashboard.css'; // Import the CSS file

export default function AttendanceDashboard() {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [q, setQ] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (q) params.q = q;
      if (date) params.date = date;
      const res = await axios.get('http://localhost:5000/api/attendance', { params });
      setRecords(res.data);
      calculateStats(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching records.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const present = data.filter(record => record.status === 'Present').length;
    const absent = data.filter(record => record.status === 'Absent').length;
    setStats({
      present,
      absent,
      total: data.length
    });
  };

  useEffect(() => {
    fetchData();
    const handler = () => fetchData();
    window.addEventListener('attendance:added', handler);
    return () => window.removeEventListener('attendance:added', handler);
  }, []);

  useEffect(() => {
    filterRecords();
  }, [records, q, date]);

  const filterRecords = () => {
    let filtered = records;
    
    if (q) {
      filtered = filtered.filter(record =>
        record.employeeName.toLowerCase().includes(q.toLowerCase()) ||
        record.employeeID.toLowerCase().includes(q.toLowerCase())
      );
    }
    
    if (date) {
      filtered = filtered.filter(record => record.date === date);
    }
    
    setFilteredRecords(filtered);
    calculateStats(filtered);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/attendance/${id}`);
      setRecords(records => records.filter(x => x.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error deleting record.');
    }
  };

  const clearFilters = () => {
    setQ('');
    setDate('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="attendance-dashboard">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p className="loading-text">Loading attendance records...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-dashboard">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header fade-in">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="dashboard-title">Attendance Dashboard</h1>
              <p className="dashboard-subtitle">Manage and monitor employee attendance records</p>
            </div>
            <button className="btn-primary" onClick={fetchData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card total slide-in">
            <div className="stat-icon total">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.total}</h3>
              <p>Total Records</p>
            </div>
          </div>
          
          <div className="stat-card present slide-in" style={{animationDelay: '0.1s'}}>
            <div className="stat-icon present">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.present}</h3>
              <p>Present</p>
            </div>
          </div>
          
          <div className="stat-card absent slide-in" style={{animationDelay: '0.2s'}}>
            <div className="stat-icon absent">
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.absent}</h3>
              <p>Absent</p>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="filters-card fade-in">
          <div className="filters-header">
            <i className="bi bi-funnel"></i>
            <h5>Filters & Search</h5>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search Employees</label>
              <div className="position-relative">
                <i className="bi bi-search input-icon"></i>
                <input
                  type="text"
                  className="filter-input with-icon"
                  placeholder="Search by name or employee ID..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                />
              </div>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Filter by Date</label>
              <div className="position-relative">
                <i className="bi bi-calendar input-icon"></i>
                <input
                  type="date"
                  className="filter-input with-icon"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            
            <button className="btn-primary" onClick={fetchData}>
              <i className="bi bi-funnel me-2"></i>
              Apply Filters
            </button>
            
            <button 
              className="btn-outline-secondary"
              onClick={clearFilters}
              disabled={!q && !date}
            >
              <i className="bi bi-x-circle"></i>
            </button>
          </div>
        </div>

        {/* Records Table Card */}
        <div className="table-card fade-in">
          <div className="table-header">
            <div className="table-header-content">
              <h5 className="table-title">
                <i className="bi bi-list-check me-2"></i>
                Attendance Records
              </h5>
              <span className="records-badge">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
          </div>

          <div className="table-content">
            {filteredRecords.length === 0 ? (
              <div className="empty-state">
                <i className="bi bi-inbox"></i>
                <h5>No records found</h5>
                <p>
                  {records.length === 0 
                    ? "No attendance records available. Start by adding some records." 
                    : "No records match your current filters."}
                </p>
                {(q || date) && (
                  <button className="btn-primary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Employee ID</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => (
                      <tr key={record.id}>
                        <td>
                          <div className="employee-info">
                            <div className="employee-avatar">
                              {getInitials(record.employeeName)}
                            </div>
                            <div className="employee-details">
                              <h6>{record.employeeName}</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="employee-id">{record.employeeID}</span>
                        </td>
                        <td>
                          <span className="date-text">{formatDate(record.date)}</span>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            record.status === 'Present' ? 'status-present' : 'status-absent'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-danger"
                              onClick={() => handleDelete(record.id)}
                              title="Delete record"
                            >
                              <i className="bi bi-trash me-1"></i>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Bootstrap Icons CSS */}
        <link 
          rel="stylesheet" 
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" 
        />
      </div>
    </div>
  );
}