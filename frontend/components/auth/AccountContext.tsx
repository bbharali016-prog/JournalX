"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { getAccounts, Account } from "@/services/api/accounts";

type AccountContextValue = {
  accounts: Account[];
  selectedAccountId: number | null; // null represents "All Accounts"
  selectedAccount: Account | null;
  loading: boolean;
  setSelectedAccountId: (id: number | null) => void;
  refreshAccounts: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue>({
  accounts: [],
  selectedAccountId: null,
  selectedAccount: null,
  loading: true,
  setSelectedAccountId: () => {},
  refreshAccounts: async () => {},
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAccounts([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getAccounts(token);
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts in context:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();

    // Load initial selection from localStorage
    const saved = localStorage.getItem("selected_account_id");
    if (saved) {
      setSelectedAccountIdState(saved === "all" ? null : Number(saved));
    }
  }, [fetchAccounts]);

  const setSelectedAccountId = (id: number | null) => {
    setSelectedAccountIdState(id);
    if (id === null) {
      localStorage.setItem("selected_account_id", "all");
    } else {
      localStorage.setItem("selected_account_id", String(id));
    }
    // Dispatch a custom event to notify other components of the account change
    window.dispatchEvent(new Event("accountChanged"));
  };

  const selectedAccount = useMemo(() => {
    if (selectedAccountId === null) return null;
    return accounts.find((acc) => acc.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  const value = useMemo(
    () => ({
      accounts,
      selectedAccountId,
      selectedAccount,
      loading,
      setSelectedAccountId,
      refreshAccounts: fetchAccounts,
    }),
    [accounts, selectedAccountId, selectedAccount, loading, fetchAccounts]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useActiveAccount() {
  return useContext(AccountContext);
}
