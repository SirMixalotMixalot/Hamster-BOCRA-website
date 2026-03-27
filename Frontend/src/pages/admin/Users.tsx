import { Ban, Search, ShieldAlert, UserCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";

type LicenceStatus = "active" | "suspended";
type AccountStatus = "active" | "banned";

type AdminUserRecord = {
  id: string;
  name: string;
  email: string;
  licenceType: string;
  dateIssued: string;
  expiryDate: string;
  complaintsReceived: number;
  licenceStatus: LicenceStatus;
  accountStatus: AccountStatus;
};

const initialUsers: AdminUserRecord[] = [
  {
    id: "u-001",
    name: "Kagiso Molefe",
    email: "kagiso.molefe@example.com",
    licenceType: "Cellular Licence",
    dateIssued: "2024-03-18",
    expiryDate: "2027-03-17",
    complaintsReceived: 5,
    licenceStatus: "active",
    accountStatus: "active",
  },
  {
    id: "u-002",
    name: "Naledi Keabetswe",
    email: "naledi.keabetswe@example.com",
    licenceType: "Broadcasting Licence",
    dateIssued: "2023-11-06",
    expiryDate: "2026-11-05",
    complaintsReceived: 2,
    licenceStatus: "active",
    accountStatus: "active",
  },
  {
    id: "u-003",
    name: "Pako Seretse",
    email: "pako.seretse@example.com",
    licenceType: "Internet Service Licence",
    dateIssued: "2022-08-10",
    expiryDate: "2025-08-09",
    complaintsReceived: 8,
    licenceStatus: "suspended",
    accountStatus: "active",
  },
  {
    id: "u-004",
    name: "Goitseone Modise",
    email: "goitseone.modise@example.com",
    licenceType: "Postal/Courier Licence",
    dateIssued: "2024-01-15",
    expiryDate: "2027-01-14",
    complaintsReceived: 1,
    licenceStatus: "active",
    accountStatus: "banned",
  },
  {
    id: "u-005",
    name: "Thato Ramasu",
    email: "thato.ramasu@example.com",
    licenceType: "Radio Frequency Licence",
    dateIssued: "2023-06-22",
    expiryDate: "2026-06-21",
    complaintsReceived: 4,
    licenceStatus: "active",
    accountStatus: "active",
  },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<AdminUserRecord[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUsers[0]?.id ?? "");

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return users;
    }
    return users.filter((user) => user.name.toLowerCase().includes(q));
  }, [search, users]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedUserId) ?? filteredUsers[0] ?? null;
  }, [users, selectedUserId, filteredUsers]);

  const updateUser = (id: string, updater: (current: AdminUserRecord) => AdminUserRecord) => {
    setUsers((current) => current.map((user) => (user.id === id ? updater(user) : user)));
  };

  const toggleLicenceSuspension = (id: string) => {
    updateUser(id, (current) => ({
      ...current,
      licenceStatus: current.licenceStatus === "active" ? "suspended" : "active",
    }));
  };

  const toggleBan = (id: string) => {
    updateUser(id, (current) => ({
      ...current,
      accountStatus: current.accountStatus === "active" ? "banned" : "active",
    }));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {!filteredUsers.length ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Users className="h-10 w-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">No matching users</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try another name in the search input</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-4">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Name</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Licence Type</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Date Issued</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Expiry Date</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Complaints Received</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      className={`cursor-pointer border-b border-border/70 transition-colors hover:bg-muted/40 ${
                        selectedUser?.id === user.id ? "bg-primary/5" : ""
                      }`}
                    >
                      <td className="px-4 py-3 text-foreground font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{user.licenceType}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(user.dateIssued)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(user.expiryDate)}</td>
                      <td className="px-4 py-3 text-foreground font-semibold">{user.complaintsReceived}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            {selectedUser ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{selectedUser.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{selectedUser.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Licence Type</p>
                    <p className="mt-1 font-medium text-foreground">{selectedUser.licenceType}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Complaints</p>
                    <p className="mt-1 font-medium text-foreground">{selectedUser.complaintsReceived}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Issued</p>
                    <p className="mt-1 font-medium text-foreground">{formatDate(selectedUser.dateIssued)}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-muted-foreground">Expiry</p>
                    <p className="mt-1 font-medium text-foreground">{formatDate(selectedUser.expiryDate)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      selectedUser.licenceStatus === "active"
                        ? "bg-bocra-teal/15 text-bocra-teal"
                        : "bg-bocra-gold/20 text-bocra-gold"
                    }`}
                  >
                    Licence: {selectedUser.licenceStatus}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      selectedUser.accountStatus === "active"
                        ? "bg-bocra-blue/15 text-bocra-blue"
                        : "bg-bocra-rose/15 text-bocra-rose"
                    }`}
                  >
                    Account: {selectedUser.accountStatus}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => toggleLicenceSuspension(selectedUser.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    {selectedUser.licenceStatus === "active" ? <ShieldAlert className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    {selectedUser.licenceStatus === "active" ? "Suspend Licence" : "Reinstate Licence"}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleBan(selectedUser.id)}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      selectedUser.accountStatus === "active"
                        ? "bg-bocra-rose text-white hover:bg-bocra-rose/90"
                        : "bg-bocra-teal text-white hover:bg-bocra-teal/90"
                    }`}
                  >
                    {selectedUser.accountStatus === "active" ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    {selectedUser.accountStatus === "active" ? "Ban User" : "Unban User"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Select a user to view details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
