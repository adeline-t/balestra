import React from "react";

export default function MainLayout({ currentUser, active, onNavigate, onLogout, children }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <span className="app-brand">Balestra</span>
          <nav className="topbar-nav">
            <button
              type="button"
              className={active === "home" ? "nav-btn active" : "nav-btn"}
              onClick={() => onNavigate("home")}
            >
              Accueil
            </button>
            <button
              type="button"
              className={active === "combats" ? "nav-btn active" : "nav-btn"}
              onClick={() => onNavigate("combats")}
            >
              Combats
            </button>
            {currentUser?.role === "superadmin" && (
              <button
                type="button"
                className={active === "users" ? "nav-btn active" : "nav-btn"}
                onClick={() => onNavigate("users")}
              >
                Utilisateurs
              </button>
            )}
          </nav>
        </div>
        <div className="topbar-right">
          <span className="topbar-user">{currentUser?.email}</span>
          <button type="button" className="ghost" onClick={onLogout}>
            Deconnexion
          </button>
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
