import { useState } from 'react';
import axios from 'axios';
import './AttendanceForm.css';

export default function AttendanceForm() {
  const [employeeName, setEmployeeName] = useState('');
  const [employeeID, setEmployeeID] = useState('');
  const [status, setStatus] = useState('Present');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!employeeName.trim() || !employeeID.trim()) {
      showMessage('Please fill in both employee name and ID.', 'error');
      return;
    }

    setLoading(true);
    const date = new Date().toISOString().split('T')[0];
    
    try {
      await axios.post('http://localhost:5000/api/attendance', {
        employeeName: employeeName.trim(),
        employeeID: employeeID.trim(),
        date,
        status
      });
      
      showMessage('Attendance recorded successfully!', 'success');
      setEmployeeName('');
      setEmployeeID('');
      setStatus('Present');
      window.dispatchEvent(new Event('attendance:added'));
    } catch (err) {
      console.error(err);
      showMessage(
        err.response?.data?.error || 'Error saving attendance. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attendance-form-container">
      <div className="form-card">
        {/* Form Header */}
        <div className="form-header">
          <div className="form-icon">
            <i className="bi bi-calendar-check"></i>
          </div>
          <h1 className="form-title">Mark Attendance</h1>
          <p className="form-subtitle">Record daily employee attendance</p>
        </div>

        {/* Messages */}
        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            <i className={`bi ${message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
            {message.text}
          </div>
        )}

        {/* Attendance Form */}
        <form className="attendance-form" onSubmit={handleSubmit}>
          {/* Employee Name */}
          <div className="form-group">
            <label className="form-label">Employee Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter full name"
              value={employeeName}
              onChange={e => setEmployeeName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Employee ID */}
          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter employee ID"
              value={employeeID}
              onChange={e => setEmployeeID(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Status Selection */}
          <div className="form-group">
            <label className="form-label">Attendance Status</label>
            <div className="status-options">
              <div
                className={`status-option present ${status === 'Present' ? 'selected' : ''}`}
                onClick={() => !loading && setStatus('Present')}
              >
                <i className="bi bi-check-circle status-icon"></i>
                Present
              </div>
              <div
                className={`status-option absent ${status === 'Absent' ? 'selected' : ''}`}
                onClick={() => !loading && setStatus('Absent')}
              >
                <i className="bi bi-x-circle status-icon"></i>
                Absent
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            className={`submit-button ${loading ? 'button-loading' : ''}`}
            type="submit"
            disabled={loading}
          >
            {loading ? '' : (
              <>
                <i className="bi bi-send-check me-2"></i>
                Submit Attendance
              </>
            )}
          </button>
        </form>

        {/* Form Footer */}
        <div className="form-footer" style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#a0aec0', fontSize: '0.9rem', margin: 0 }}>
            <i className="bi bi-info-circle me-1"></i>
            Today's date: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Add Bootstrap Icons */}
      <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" 
      />
    </div>
  );
}