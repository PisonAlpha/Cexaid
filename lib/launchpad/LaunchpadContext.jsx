"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "@wagmi/core";
import { parseUnits } from "viem";
import { createClient } from "@/lib/supabase/client";
import { wagmiConfig } from "./wagmiConfig";
import { computeRoundStatus, isRoundPublic } from "./roundStatus";
import {
  USDT_TOKEN_ADDRESS,
  USDT_DECIMALS,
  CONTRIBUTION_PAYMENT_WALLET,
  ERC20_TRANSFER_ABI,
} from "./contracts";

const LaunchpadContext = createContext(null);

// ---------------------------------------------------------------------------
// DB row (snake_case) -> UI shape (camelCase). Keeping this translation in
// one place means every component below (RoundCard, ContributionForm,
// ProjectCard, etc.) can stay exactly as they were - they never touch
// Supabase directly or know its column names.
// ---------------------------------------------------------------------------

function mapProject(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    website: row.website,
    logoUrl: row.logo_url,
    twitter: row.twitter,
    telegram: row.telegram,
    founderWallet: row.founder_wallet,
    isDemo: row.is_demo ?? false,
  };
}

function mapRound(row) {
  return {
    id: row.id,
    projectId: row.project_id,
    slug: row.slug,
    type: row.type,
    roundNumber: row.round_number,
    title: row.title,
    tagline: row.tagline,
    tokenSymbol: row.token_symbol,
    tokenPriceUSD: Number(row.token_price_usd),
    totalAllocationUSD: Number(row.total_allocation_usd),
    raisedUSD: Number(row.raised_usd),
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    minTicketUSD: Number(row.min_ticket_usd),
    maxTicketUSD: Number(row.max_ticket_usd),
    requiresApproval: row.requires_approval,
    approvalStatus: row.approval_status,
    paymentStatus: row.payment_status,
    vestingSchedule: row.vesting_schedule,
    chain: row.chain || "BNB Chain",
    status: computeRoundStatus({ startsAt: row.starts_at, endsAt: row.ends_at }),
  };
}

function mapContribution(row) {
  return {
    id: row.id,
    wallet: row.wallet,
    amountUSD: Number(row.amount_usd),
    claimTokens: Number(row.claim_tokens),
    roundId: row.round_id,
    projectId: row.project_id,
    txHash: row.tx_hash,
    timestamp: row.created_at,
  };
}

export function LaunchpadProvider({ children }) {
  const supabase = useMemo(() => createClient(), []);

  // --- Real wallet connection via wagmi ---
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting, error: connectErrorObj } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  // --- Real data from Supabase ---
  const [projects, setProjects] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const [{ data: projectRows }, { data: roundRows }, { data: contribRows }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at", { ascending: false }),
      supabase.from("rounds").select("*"),
      supabase.from("contributions").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    setProjects((projectRows ?? []).map(mapProject));
    setRounds((roundRows ?? []).map(mapRound));
    setContributions((contribRows ?? []).map(mapContribution));
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Round timing (live/upcoming/closed) depends on the clock, not just the
  // database - recompute every 30s so a round doesn't stay stuck showing
  // "upcoming" after its start time passes without a page refresh.
  useEffect(() => {
    const id = setInterval(() => {
      setRounds((prev) =>
        prev.map((r) => ({ ...r, status: computeRoundStatus({ startsAt: r.startsAt, endsAt: r.endsAt }) }))
      );
    }, 30000);
    return () => clearInterval(id);
  }, []);

  // --- Investor account: real email/password auth via Supabase, NOT
  // wallet-based. Approval is tied to being logged into this account -
  // the connected wallet is only the payment rail, never the approval key. ---
  const [investorUser, setInvestorUser] = useState(undefined); // undefined = loading, null = logged out
  const [investorStatus, setInvestorStatus] = useState("none");
  const [investorRejectionReason, setInvestorRejectionReason] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setInvestorUser(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setInvestorUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const refreshInvestorStatus = useCallback(async () => {
    const res = await fetch("/api/launchpad/investor-applications").then((r) => r.json());
    if (res.ok) {
      setInvestorStatus(res.status);
      setInvestorRejectionReason(res.rejectionReason ?? null);
    }
  }, []);

  useEffect(() => {
    refreshInvestorStatus();
  }, [investorUser, refreshInvestorStatus]);

  const investorSignUp = useCallback(
    async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { ok: false, error: error.message };
      const needsConfirmation = !data.session;
      return { ok: true, needsConfirmation };
    },
    [supabase]
  );

  const investorSignIn = useCallback(
    async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [supabase]
  );

  const investorSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase]);

  const submitApplication = useCallback(
    async (form) => {
      if (!investorUser) return { ok: false, error: "Sign up or log in first." };
      const res = await fetch("/api/launchpad/investor-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => r.json());
      if (res.ok) setInvestorStatus("pending");
      return res;
    },
    [investorUser]
  );

  // --- Founder KYC status ---
  const [kycStatus, setKycStatus] = useState("none");
  const [kycRejectionReason, setKycRejectionReason] = useState(null);

  const refreshKycStatus = useCallback(async () => {
    if (!address) {
      setKycStatus("none");
      setKycRejectionReason(null);
      return;
    }
    const res = await fetch(`/api/launchpad/kyc?wallet=${address}`).then((r) => r.json());
    if (res.ok) {
      setKycStatus(res.status);
      setKycRejectionReason(res.rejectionReason);
    }
  }, [address]);

  useEffect(() => {
    refreshKycStatus();
  }, [refreshKycStatus]);

  const submitKyc = useCallback(
    async (form) => {
      if (!address) return { ok: false, error: "Connect a wallet first." };
      const res = await fetch("/api/launchpad/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, ...form }),
      }).then((r) => r.json());
      if (res.ok) setKycStatus("pending");
      return res;
    },
    [address]
  );

  const wallet = {
    address: isConnected ? address ?? null : null,
    isApprovedInvestor: Boolean(investorUser) && investorStatus === "approved",
  };

  const myApplication = useMemo(
    () => (investorStatus === "none" ? null : { status: investorStatus }),
    [investorStatus]
  );

  const connectWallet = useCallback(
    (connectorId) => {
      const target = connectorId
        ? connectors.find((c) => c.id === connectorId)
        : connectors[0];
      if (target) connect({ connector: target });
    },
    [connect, connectors]
  );
  const disconnectWallet = useCallback(() => disconnect(), [disconnect]);

  const myProject = useMemo(
    () => (wallet.address ? projects.find((p) => p.founderWallet === wallet.address) : null),
    [projects, wallet.address]
  );

  const liveProjects = useMemo(
    () => projects.filter((p) => rounds.some((r) => r.projectId === p.id && isRoundPublic(r))),
    [projects, rounds]
  );

  const roundsForProject = useCallback(
    (projectId) => rounds.filter((r) => r.projectId === projectId),
    [rounds]
  );

  // --- Private Sale (reviewed) submission ---
  const createPrivateSaleListing = useCallback(
    async (form) => {
      if (!wallet.address) return { ok: false, error: "Connect a wallet first." };
      const res = await fetch("/api/launchpad/private-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: wallet.address, ...form }),
      }).then((r) => r.json());
      if (res.ok) await refresh();
      return res;
    },
    [wallet.address, refresh]
  );

  // --- Client-side pre-check for instant feedback (server re-checks everything) ---
  const validateContribution = useCallback(
    (roundId, amountUSD) => {
      const round = rounds.find((r) => r.id === roundId);
      if (!round) return { ok: false, error: "Round not found." };
      if (!isRoundPublic(round))
        return { ok: false, error: "This round is still under CEXAID review." };
      if (!wallet.address) return { ok: false, error: "Connect a wallet first." };
      if (round.status !== "live")
        return { ok: false, error: "This round is not open for contributions." };
      if (round.requiresApproval && !wallet.isApprovedInvestor)
        return { ok: false, error: "Private Sale is limited to approved investors. Apply for access first." };
      if (!amountUSD || amountUSD <= 0) return { ok: false, error: "Enter a contribution amount." };
      if (amountUSD < round.minTicketUSD)
        return { ok: false, error: `Minimum ticket is $${round.minTicketUSD.toLocaleString()}.` };
      if (amountUSD > round.maxTicketUSD)
        return { ok: false, error: `Maximum ticket is $${round.maxTicketUSD.toLocaleString()}.` };
      if (round.raisedUSD + amountUSD > round.totalAllocationUSD)
        return { ok: false, error: "This contribution would exceed the round allocation." };
      return { ok: true };
    },
    [rounds, wallet]
  );

  const contribute = useCallback(
    async (roundId, amountUSD) => {
      const check = validateContribution(roundId, amountUSD);
      if (!check.ok) return check;

      let txHash;
      try {
        txHash = await writeContractAsync({
          address: USDT_TOKEN_ADDRESS,
          abi: ERC20_TRANSFER_ABI,
          functionName: "transfer",
          args: [CONTRIBUTION_PAYMENT_WALLET, parseUnits(String(amountUSD), USDT_DECIMALS)],
        });
        await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      } catch (err) {
        return { ok: false, error: err?.shortMessage || "Transaction was rejected or failed." };
      }

      const res = await fetch("/api/launchpad/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId, wallet: wallet.address, amountUSD, txHash }),
      }).then((r) => r.json());

      if (res.ok) await refresh();
      return { ...res, txHash };
    },
    [wallet.address, writeContractAsync, validateContribution, refresh]
  );

  const value = useMemo(
    () => ({
      wallet,
      connectors,
      connectWallet,
      disconnectWallet,
      isConnecting,
      connectError: connectErrorObj ? connectErrorObj.message : null,
      myApplication,
      investorUser,
      investorRejectionReason,
      investorSignUp,
      investorSignIn,
      investorSignOut,
      submitApplication,
      kycStatus,
      kycRejectionReason,
      submitKyc,
      projects,
      liveProjects,
      myProject,
      rounds,
      roundsForProject,
      createPrivateSaleListing,
      contributions,
      contribute,
      validateContribution,
      loaded,
      refresh,
    }),
    [
      wallet,
      connectors,
      connectWallet,
      disconnectWallet,
      isConnecting,
      connectErrorObj,
      myApplication,
      investorUser,
      investorRejectionReason,
      investorSignUp,
      investorSignIn,
      investorSignOut,
      submitApplication,
      kycStatus,
      kycRejectionReason,
      submitKyc,
      projects,
      liveProjects,
      myProject,
      rounds,
      roundsForProject,
      createPrivateSaleListing,
      contributions,
      contribute,
      validateContribution,
      loaded,
      refresh,
    ]
  );

  return <LaunchpadContext.Provider value={value}>{children}</LaunchpadContext.Provider>;
}

export function useLaunchpad() {
  const ctx = useContext(LaunchpadContext);
  if (!ctx) throw new Error("useLaunchpad must be used within LaunchpadProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Remaining known trade-offs, honestly flagged:
// 1. The `rounds` RLS policy allows public SELECT on every round regardless
//    of approval/payment status - meaning a pending private-sale round's
//    terms are technically fetchable by anyone who queries directly, even
//    before you approve it. No money is at risk from this (contributions
//    are blocked server-side regardless), but if you want it fully hidden
//    pre-approval, tighten the RLS policy to filter on approval_status/
//    payment_status, or move unapproved rounds to a separate non-public
//    table until approved.
// 2. There's no rate limiting on any of these API routes yet - someone
//    could spam /api/launchpad/private-sale with junk projects. Consider adding
//    rate limiting (e.g. Vercel's built-in, or a simple IP-based check)
//    before this is under real load.
// ---------------------------------------------------------------------------
