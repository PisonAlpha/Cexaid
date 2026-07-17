"use client";

import { useState } from "react";
import { useLaunchpad } from "@/lib/launchpad/LaunchpadContext";

export function WalletConnectButton() {
  const { wallet, connectors, connectWallet, disconnectWallet, isConnecting, connectError } =
    useLaunchpad();
  const [menuOpen, setMenuOpen] = useState(false);

  if (wallet.address) {
    return (
      <button className="wallet-btn wallet-btn--connected" onClick={disconnectWallet}>
        <span className="wallet-btn__status">
          {wallet.isApprovedInvestor ? "Approved investor" : "Connected"}
        </span>
        <span className="wallet-btn__addr">
          {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)}
        </span>
        <style jsx>{`
          .wallet-btn--connected {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            background: var(--lp-panel);
            border: 1px solid var(--lp-brass);
            color: var(--lp-ink);
            font-family: var(--lp-font-mono);
            font-size: 0.75rem;
            padding: 0.5rem 0.9rem;
            border-radius: 2px;
            cursor: pointer;
          }
          .wallet-btn__status {
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--lp-brass);
            font-size: 0.68rem;
          }
          .wallet-btn__addr {
            color: var(--lp-mute);
          }
        `}</style>
      </button>
    );
  }

  return (
    <div className="wallet-wrap">
      <button
        className="wallet-btn"
        onClick={() => setMenuOpen((v) => !v)}
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting…" : "Connect Wallet"}
      </button>

      {menuOpen && (
        <div className="wallet-menu">
          {connectors.length === 0 && (
            <p className="wallet-menu__empty">
              No wallet connectors configured. Add a WalletConnect Project ID
              in .env.local.
            </p>
          )}
          {connectors.map((connector) => (
            <button
              key={connector.id}
              className="wallet-menu__item"
              onClick={() => {
                connectWallet(connector.id);
                setMenuOpen(false);
              }}
            >
              {connector.name}
            </button>
          ))}
        </div>
      )}

      {connectError && <p className="wallet-error">{connectError}</p>}

      <style jsx>{`
        .wallet-wrap {
          position: relative;
        }
        .wallet-btn {
          background: var(--lp-brass);
          color: var(--lp-void);
          font-family: var(--lp-font-body);
          font-weight: 600;
          font-size: 0.85rem;
          padding: 0.6rem 1.1rem;
          border-radius: 2px;
          border: 1px solid var(--lp-brass);
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .wallet-btn:hover {
          background: var(--lp-brass-bright);
        }
        .wallet-btn:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .wallet-menu {
          position: absolute;
          right: 0;
          top: calc(100% + 0.5rem);
          background: var(--lp-panel);
          border: 1px solid var(--lp-line);
          border-radius: 2px;
          min-width: 200px;
          z-index: 20;
          display: flex;
          flex-direction: column;
          padding: 0.35rem;
          gap: 0.15rem;
        }
        .wallet-menu__item {
          background: transparent;
          border: none;
          color: var(--lp-ink);
          font-family: var(--lp-font-body);
          font-size: 0.85rem;
          text-align: left;
          padding: 0.55rem 0.6rem;
          border-radius: 2px;
          cursor: pointer;
        }
        .wallet-menu__item:hover {
          background: var(--lp-panel-raised);
          color: var(--lp-brass);
        }
        .wallet-menu__empty {
          font-family: var(--lp-font-body);
          font-size: 0.75rem;
          color: var(--lp-mute);
          padding: 0.5rem;
          margin: 0;
          max-width: 220px;
        }
        .wallet-error {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.4rem;
          font-family: var(--lp-font-body);
          font-size: 0.72rem;
          color: var(--lp-signal-red);
          max-width: 220px;
        }
      `}</style>
    </div>
  );
}
