import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle, Check, ChevronDown, MoreHorizontal, RefreshCw,
    Search, Shield, Trash2, UserRound, Users, X,
} from 'lucide-react';
import API from '../services/api';
import { Badge, Button, Card } from '../components/UI';

const ROLE_OPTIONS = ['all', 'admin', 'user'];

const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

const TeamMembers = ({ currentUser }) => {
    const [members, setMembers] = useState([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [openMenu, setOpenMenu] = useState(null);
    const [pendingMember, setPendingMember] = useState(null);
    const [savingId, setSavingId] = useState(null);

    const fetchMembers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get('/users');
            setMembers(response.data.data || []);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to load team members.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) fetchMembers();
    }, [currentUser?.id]);

    const filteredMembers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return members.filter((member) => {
            const matchesSearch = !query
                || member.name.toLowerCase().includes(query)
                || member.email.toLowerCase().includes(query);
            return matchesSearch && (roleFilter === 'all' || member.role === roleFilter);
        });
    }, [members, roleFilter, search]);

    const updateRole = async (member, role) => {
        setSavingId(member.id);
        setOpenMenu(null);
        setError('');
        try {
            const response = await API.patch(`/admin/members/${member.id}`, { role });
            setMembers((items) => items.map((item) => item.id === member.id ? response.data.data : item));
            setNotice(`${member.name}'s role was updated.`);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to update this member.'));
        } finally {
            setSavingId(null);
        }
    };

    const removeMember = async () => {
        if (!pendingMember) return;
        setSavingId(pendingMember.id);
        setError('');
        try {
            await API.delete(`/admin/members/${pendingMember.id}`);
            setMembers((items) => items.filter((item) => item.id !== pendingMember.id));
            setNotice(`${pendingMember.name} was removed from the team.`);
        } catch (requestError) {
            setError(getErrorMessage(requestError, 'Unable to remove this member.'));
        } finally {
            setPendingMember(null);
            setSavingId(null);
        }
    };

    return (
        <section className="team-page fade-in">
            <div className="team-summary">
                <Card noHover className="team-stat-card">
                    <div className="stat-label"><Users size={13} style={{ color: '#60a5fa' }} /> Total members</div>
                    <div className="stat-value" style={{ color: '#60a5fa' }}>{members.length}</div>
                </Card>
                <Card noHover className="team-stat-card">
                    <div className="stat-label"><Shield size={13} style={{ color: '#34d399' }} /> Administrators</div>
                    <div className="stat-value" style={{ color: '#34d399' }}>{members.filter((member) => member.role === 'admin').length}</div>
                </Card>
            </div>

            {notice && (
                <div className="alert alert-success"><Check size={15} /> {notice}
                    <button className="alert-dismiss" onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button>
                </div>
            )}
            {error && (
                <div className="alert alert-error"><AlertCircle size={15} /> {error}
                    <Button variant="secondary" className="btn-sm" onClick={fetchMembers} disabled={loading}>Retry</Button>
                    <button className="alert-dismiss" onClick={() => setError('')} aria-label="Dismiss error"><X size={15} /></button>
                </div>
            )}

            <Card noHover className="team-card">
                <div className="team-toolbar">
                    <div className="team-search">
                        <Search size={16} />
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or email..." aria-label="Search members" />
                    </div>
                    <label className="team-filter">
                        <span className="sr-only">Filter by role</span>
                        <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                            {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role === 'all' ? 'All roles' : role}</option>)}
                        </select>
                        <ChevronDown size={15} />
                    </label>
                    <button className="btn-icon" onClick={fetchMembers} disabled={loading} title="Refresh members" aria-label="Refresh members">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {loading ? (
                    <div className="spinner"><div className="spinner-circle" /><span className="spinner-text">Loading members...</span></div>
                ) : filteredMembers.length === 0 ? (
                    <div className="empty-state team-empty">
                        <UserRound size={28} style={{ color: '#334155' }} />
                        <div className="empty-state-title">{members.length === 0 ? 'No team members yet' : 'No matching members'}</div>
                        <div className="empty-state-sub">{members.length === 0 ? 'Members will appear here when they join your workspace.' : 'Try changing your search or role filter.'}</div>
                    </div>
                ) : (
                    <div className="member-table-wrap">
                        <table className="member-table">
                            <thead><tr><th>Member</th><th>Email</th><th>Role</th><th className="member-actions-heading">Actions</th></tr></thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td data-label="Member"><div className="member-identity"><div className="member-avatar">{member.name.charAt(0).toUpperCase()}</div><span>{member.name}{member.id === currentUser.id && <small>You</small>}</span></div></td>
                                        <td data-label="Email" className="member-email">{member.email}</td>
                                        <td data-label="Role"><Badge variant={member.role === 'admin' ? 'emerald' : 'blue'}>{member.role}</Badge></td>
                                        <td data-label="Actions" className="member-actions">
                                            {currentUser?.role === 'admin' ? (
                                                <div className="member-menu-wrap">
                                                    <button className="btn-icon" onClick={() => setOpenMenu(openMenu === member.id ? null : member.id)} disabled={savingId === member.id} aria-label={`Actions for ${member.name}`}><MoreHorizontal size={17} /></button>
                                                    {openMenu === member.id && (
                                                        <div className="member-menu">
                                                            <button onClick={() => updateRole(member, member.role === 'admin' ? 'user' : 'admin')} disabled={member.id === currentUser.id}>
                                                                <Shield size={14} /> {member.role === 'admin' ? 'Make user' : 'Make admin'}
                                                            </button>
                                                            <button className="danger-option" onClick={() => { setPendingMember(member); setOpenMenu(null); }} disabled={member.id === currentUser.id}>
                                                                <Trash2 size={14} /> Remove member
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : <span className="member-readonly">View only</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {pendingMember && (
                <div className="modal-backdrop" role="presentation">
                    <div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="remove-member-title">
                        <div className="confirm-icon"><Trash2 size={20} /></div>
                        <h3 id="remove-member-title">Remove {pendingMember.name}?</h3>
                        <p>This will permanently remove their account and associated tasks. This action cannot be undone.</p>
                        <div className="confirm-actions"><Button variant="secondary" onClick={() => setPendingMember(null)}>Cancel</Button><Button variant="danger" onClick={removeMember} disabled={savingId === pendingMember.id}>Remove member</Button></div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TeamMembers;
