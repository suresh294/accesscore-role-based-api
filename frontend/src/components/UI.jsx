export const MeshBg = () => <div className="mesh-bg" />;

export const Button = ({ children, onClick, type = "button", variant = "primary", disabled = false, icon: Icon, className = "" }) => {
    const variantClass = {
        primary: "btn btn-primary",
        secondary: "btn btn-secondary",
        danger: "btn btn-danger",
        success: "btn btn-success",
    }[variant] || "btn btn-primary";

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={`${variantClass} ${className}`}>
            {Icon && <Icon size={16} />}
            {children}
        </button>
    );
};

export const Input = ({ label, icon: Icon, type = "text", error, ...props }) => (
    <div className="auth-input-group">
        {label && <label className="auth-label">{label}</label>}
        <div className="auth-input-wrap">
            {Icon && (
                <span className="auth-input-icon">
                    <Icon size={16} />
                </span>
            )}
            <input
                type={type}
                className="auth-input"
                style={Icon ? {} : { paddingLeft: '0.875rem' }}
                {...props}
            />
        </div>
        {error && <span style={{ fontSize: '0.7rem', color: '#f87171', marginTop: '0.25rem' }}>{error}</span>}
    </div>
);

export const Card = ({ children, className = "", noHover = false }) => (
    <div className={`card ${noHover ? 'nohover' : ''} ${className}`}>
        {children}
    </div>
);

export const Badge = ({ children, variant = "blue" }) => {
    const styles = {
        blue: { background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.25)' },
        emerald: { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' },
        slate: { background: 'rgba(100,116,139,0.1)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' },
    };
    return (
        <span style={{
            ...styles[variant] || styles.blue,
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px',
            display: 'inline-block',
        }}>
            {children}
        </span>
    );
};
