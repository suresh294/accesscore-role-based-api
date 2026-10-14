import { useEffect, useState } from 'react';
import { Check, LockKeyhole, Mail, Save, Shield, UserRound, X } from 'lucide-react';
import API from '../services/api';
import { Badge, Button, Card } from '../components/UI';

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const Settings = ({ currentUser, onUserUpdated }) => {
    const [profile, setProfile] = useState({ name: '', email: '', role: '' });
    const [initialProfile, setInitialProfile] = useState({ name: '', email: '', role: '' });
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await API.get('/users/me');
                const user = response.data.data;
                const nextProfile = { name: user.name, email: user.email, role: user.role };
                setProfile(nextProfile);
                setInitialProfile(nextProfile);
            } catch (requestError) {
                setError(getErrorMessage(requestError, 'Unable to load your account settings.'));
            } finally {
                setLoading(false);
            }
        };
        if (currentUser) loadProfile();
    }, [currentUser?.id]);

    const clearFeedback = () => {
        setError('');
        setNotice('');
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        clearFeedback();
        if (!profile.name.trim()) {
            setError('Name is required.');
            return;
        }
        setSavingProfile(true);
        try {
            const response = await API.patch('/users/me', {
                name: profile.name.trim(),
                email: profile.email.trim(),
            });
            const updatedUser = { ...response.data.data, token: currentUser.token };
            setProfile(updatedUser);
            setInitialProfile(updatedUser);
            onUserUpdated(updatedUser);
            setNotice('Account information saved successfully.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to save account information.'));
        } finally {
            setSavingProfile(false);
        }
    };

    const changePassword = async (event) => {
        event.preventDefault();
        clearFeedback();
        if (passwords.newPassword.length < 6) {
            setError('New password must be at least 6 characters long.');
            return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New password and confirmation do not match.');
            return;
        }
        setSavingPassword(true);
        try {
            await API.patch('/users/me/password', passwords);
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setNotice('Password changed successfully.');
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to change your password.'));
        } finally {
            setSavingPassword(false);
        }
    };

    if (loading) {
        return <div className="spinner"><div className="spinner-circle" /><span className="spinner-text">Loading settings...</span></div>;
    }

    return (
        <section className="settings-page fade-in">
            {notice && <div className="alert alert-success"><Check size={15} /> {notice}<button className="alert-dismiss" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
            {error && <div className="alert alert-error"><X size={15} /> {error}<button className="alert-dismiss" onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button></div>}

            <div className="settings-grid">
                <Card noHover>
                    <div className="settings-section-heading"><UserRound size={18} /><div><h3>Account information</h3><p>Update the profile details used across AccessCore.</p></div></div>
                    <form onSubmit={saveProfile}>
                        <div className="settings-form-grid">
                            <label className="settings-field"><span>Name</span><div className="settings-input-wrap"><UserRound size={15} /><input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} required maxLength={255} /></div></label>
                            <label className="settings-field"><span>Email address</span><div className="settings-input-wrap"><Mail size={15} /><input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} required maxLength={255} /></div></label>
                        </div>
                        <div className="settings-role"><Shield size={15} /><span>Role</span><Badge variant={profile.role === 'admin' ? 'emerald' : 'blue'}>{profile.role}</Badge><small>Managed by administrators</small></div>
                        <div className="settings-actions">
                            <Button variant="secondary" onClick={() => setProfile(initialProfile)} disabled={savingProfile}>Cancel</Button>
                            <Button type="submit" icon={Save} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</Button>
                        </div>
                    </form>
                </Card>

                <Card noHover>
                    <div className="settings-section-heading"><LockKeyhole size={18} /><div><h3>Password and security</h3><p>Use a unique password of at least six characters.</p></div></div>
                    <form onSubmit={changePassword}>
                        <div className="settings-password-fields">
                            <label className="settings-field"><span>Current password</span><input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} required autoComplete="current-password" /></label>
                            <label className="settings-field"><span>New password</span><input type="password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} required minLength={6} autoComplete="new-password" /></label>
                            <label className="settings-field"><span>Confirm new password</span><input type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords({ ...passwords, confirmPassword: event.target.value })} required minLength={6} autoComplete="new-password" /></label>
                        </div>
                        <div className="settings-actions"><Button type="submit" icon={LockKeyhole} disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Change Password'}</Button></div>
                    </form>
                </Card>
            </div>
        </section>
    );
};

export default Settings;
