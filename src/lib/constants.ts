export const NEXGO_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMjAgMTAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZzEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRjBEMDgwIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTAlIiBzdHlsZT0ic3RvcC1jb2xvcjojQzlBODRDIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhBNjgyMCIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZzIiIHgxPSIwJSIgeTE9IjEwMCUiIHgyPSIxMDAlIiB5Mj0iMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOUE3QTJFIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I0U4Qzk3QSIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPCEtLSBTcGVlZCBsaW5lcyAtLT4KICA8cmVjdCB4PSI4IiB5PSIzNiIgd2lkdGg9IjI2IiBoZWlnaHQ9IjUiIHJ4PSIyLjUiIGZpbGw9InVybCgjZzEpIiBvcGFjaXR5PSIwLjkiLz4KICA8cmVjdCB4PSI0IiB5PSI0OCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjQiIHJ4PSIyIiBmaWxsPSJ1cmwoI2cxKSIgb3BhY2l0eT0iMC42Ii8+CiAgPCEtLSBPdXRlciBjaGV2cm9uIC0tPgogIDxwYXRoIGQ9Ik0zOCAxNSBMNjggNTAgTDM4IDg1IEw1MiA4NSBMODIgNTAgTDUyIDE1IFoiIGZpbGw9InVybCgjZzEpIi8+CiAgPCEtLSBJbm5lciBjaGV2cm9uIChsaWdodGVyLCBjcmVhdGVzIGRlcHRoKSAtLT4KICA8cGF0aCBkPSJNNTQgMjIgTDc4IDUwIEw1NCA3OCBMNjIgNzggTDg4IDUwIEw2MiAyMiBaIiBmaWxsPSJ1cmwoI2cyKSIgb3BhY2l0eT0iMC43NSIvPgogIDwhLS0gTmV4R28gdGV4dCAtLT4KICA8dGV4dCB4PSI5OCIgeT0iNjkiIGZvbnQtZmFtaWx5PSJBcmlhbCBCbGFjaywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI1MCIgZm9udC13ZWlnaHQ9IjkwMCIgZmlsbD0idXJsKCNnMSkiIGxldHRlci1zcGFjaW5nPSItMC41Ij5OZXhHbzwvdGV4dD4KPC9zdmc+";

export const NAV_CONFIG = {
  student: {
    left: [
      { id: "home", icon: "⊞", label: "Home" },
      { id: "chow", icon: "🍽️", label: "NexChow" },
    ],
    right: [
      { id: "wallet", icon: "💳", label: "Wallet" },
      { id: "profile", icon: "👤", label: "Profile" },
    ],
    more: [
      { id: "dispatch", icon: "📦", label: "Dispatch" },
      { id: "trip", icon: "🚌", label: "NexTrip" },
      { id: "chat", icon: "💬", label: "Support" },
    ],
  },
  vendor: {
    left: [
      { id: "dashboard", icon: "📊", label: "Dashboard" },
      { id: "orders", icon: "📦", label: "Orders" },
    ],
    right: [
      { id: "menu", icon: "🍽️", label: "Menu" },
      { id: "profile", icon: "👤", label: "Profile" },
    ],
    more: [
      { id: "earnings", icon: "💳", label: "Earnings" },
      { id: "chat", icon: "💬", label: "Support" },
    ],
  },
  rider: {
    left: [
      { id: "rdashboard", icon: "📊", label: "Dashboard" },
      { id: "deliveries", icon: "🏍️", label: "Active" },
    ],
    right: [
      { id: "earnings", icon: "💳", label: "Earnings" },
      { id: "profile", icon: "👤", label: "Profile" },
    ],
    more: [
      { id: "chat", icon: "💬", label: "Support" },
    ],
  },
  admin: {
    left: [
      { id: "adashboard", icon: "📊", label: "Dashboard" },
      { id: "users", icon: "👥", label: "Users" },
    ],
    right: [
      { id: "analytics", icon: "📈", label: "Analytics" },
      { id: "profile", icon: "👤", label: "Profile" },
    ],
    more: [],
  },
} as const;

export type AppRole = "student" | "vendor" | "rider" | "admin";

export const DEFAULT_TAB: Record<AppRole, string> = {
  student: "home",
  vendor: "dashboard",
  rider: "rdashboard",
  admin: "adashboard",
};
