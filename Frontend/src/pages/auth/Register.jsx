import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useState } from 'react';

const schema = yup.object({
  name: yup.string().min(2).required('Name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required('Password required'),
  role: yup.string().oneOf(['student', 'faculty']).required('Role required'),
  department: yup.string().required('Department required'),
});

export default function Register() {
  const navigate = useNavigate();
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data) => {
    try {
      setServerErr('');
      await api.post('/auth/register', data);
      navigate('/login');
    } catch (err) {
      setServerErr(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputCls = 'w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl shadow-xl p-8 border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">🎓 My-Campus</h1>
          <p className="text-gray-400 mt-1">Create your account</p>
        </div>

        {serverErr && (
          <div className="mb-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-300 text-sm">
            {serverErr}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {[
            { name: 'name', label: 'Full Name', placeholder: 'Shivakant Kurmi', type: 'text' },
            { name: 'email', label: 'Email', placeholder: 'you@campus.edu', type: 'email' },
            { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
            { name: 'department', label: 'Department', placeholder: 'Computer Science', type: 'text' },
          ].map(({ name, label, placeholder, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
              <input {...register(name)} type={type} placeholder={placeholder} className={inputCls} />
              {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name].message}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
            <select {...register('role')} className={inputCls}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition mt-2"
          >
            {isSubmitting ? 'Registering…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
