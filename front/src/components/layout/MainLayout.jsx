import React from "react";
import { FaCog } from "react-icons/fa";

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
          <span className="topbar-user">
            {currentUser
              ? currentUser.prenom || currentUser.nom
                ? `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim()
                : currentUser.email
              : ""}
          </span>
          {currentUser && (
            <button
              type="button"
              className="icon-btn"
              aria-label="Parametres du compte"
              title="Parametres du compte"
              onClick={() => onNavigate("account")}
            >
              <FaCog />
            </button>
          )}
          <button type="button" className="ghost" onClick={onLogout}>
            Deconnexion
          </button>
        </div>
      </header>
      <main className="app-content">{children}</main>
    </div>
  );
}
