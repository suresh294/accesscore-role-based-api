import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { MeshBg } from '../components/UI';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        const result = await login(email, password);
        if (result.success) navigate('/dashboard');
        else setError(result.message || 'Invalid email or password');
        setIsSubmitting(false);
    };

    return (
        <div className="page-center">
            <MeshBg />
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <div className="auth-icon">
                        <ShieldCheck size={26} color="white" />
                    </div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to your account</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <AlertCircle size={15} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-input-group">
                        <label className="auth-label">Email Address</label>
                        <div className="auth-input-wrap">
                            <span className="auth-input-icon"><Mail size={16} /></span>
                            <input
                                type="email"
                                className="auth-input"
                                placeholder="john@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                className="auth-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary btn-full"
                        style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}
                    >
                        {isSubmitting ? (
                            <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                        ) : (
                            <><ShieldCheck size={16} /> Log In</>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create one</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
