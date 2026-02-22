import useAuthStore from '../../store/authStore';
import FacultyAttendance from './FacultyAttendance';
import StudentAttendance from './StudentAttendance';

export default function Attendance() {
  const { user } = useAuthStore();
  return user?.role === 'faculty' ? <FacultyAttendance /> : <StudentAttendance />;
}
