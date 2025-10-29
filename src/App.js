import AttendanceForm from './components/AttendanceForm';
import AttendanceDashboard from './components/AttendanceDashboard';

export default function App(){
  return (
    <div className="container py-4">
      <h1 className="mb-4">Employee Attendance Tracker</h1>
      <div className="row">
        <div className="col-md-5">
          <AttendanceForm />
        </div>
        <div className="col-md-7">
          <AttendanceDashboard />
        </div>
      </div>
    </div>
  );
}
