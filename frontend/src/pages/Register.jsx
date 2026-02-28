import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { MeshBg } from '../components/UI';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setIsSubmitting(true);
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) navigate('/dashboard');
        else setError(result.message || 'Registration failed. Please try again.');
        setIsSubmitting(false);
    };

    return (
        <div className="page-center">
            <MeshBg />
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="auth-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <UserPlus size={24} color="white" />
                    </div>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join AccessCore today</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={15} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">Full Name</label>
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon"><User size={16} /></span>
                            <input
                                type="text"
                                name="name"
                                className="auth-input"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete="name"
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon"><Mail size={16} /></span>
                            <input
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon"><Lock size={16} /></span>
                            <input
                                type="password"
                                name="password"
                                className="auth-input"
                                placeholder="Min. 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary btn-full"
                        style={{ marginTop: '0.5rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #10b981, #059669)' }}
                    >
                        {isSubmitting ? (
                            <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                        ) : (
                            <><UserPlus size={16} /> Sign Up</>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Log in</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
