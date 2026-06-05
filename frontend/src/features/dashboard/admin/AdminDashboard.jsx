import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import {
  analyticsAPI,
  crmAPI,
  bookingAPI,
  rentalAPI,
  shopAPI,
  inventoryAPI,
  authAPI,
} from "../../../services/api.js";
import DashboardLayout from "../../../layouts/DashboardLayout.jsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Calendar,
  Repeat,
  ShoppingBag,
  Database,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  ArrowUpRight,
  Loader,
  ShieldAlert,
} from "lucide-react";

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const location = useLocation();

  // Panels derived from active sidebar route path: 'stats', 'crm', 'bookings', 'rentals', 'orders', 'inventory', 'users'
  const path = location.pathname;
  let panel = "stats";
  if (path.endsWith("/crm")) panel = "crm";
  else if (path.endsWith("/bookings")) panel = "bookings";
  else if (path.endsWith("/rentals")) panel = "rentals";
  else if (path.endsWith("/orders")) panel = "orders";
  else if (path.endsWith("/inventory")) panel = "inventory";
  else if (path.endsWith("/users")) panel = "users";

  // Modal/Creation states
  const [activeItem, setActiveItem] = useState(null); // Used for editing leads or inventory items
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    name: "",
    sku: "",
    description: "",
    category: "Camera",
    type: "Rental",
    total_quantity: 1,
    price_per_day: 0,
    sale_price: 0,
  });

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: analyticsAPI.dashboard,
  });
  const { data: leads } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: crmAPI.listLeads,
    enabled: panel === "crm",
  });
  const { data: bookings } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: bookingAPI.list,
    enabled: panel === "bookings",
  });
  const { data: rentals } = useQuery({
    queryKey: ["admin-rentals"],
    queryFn: rentalAPI.list,
    enabled: panel === "rentals",
  });
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: shopAPI.getOrders,
    enabled: panel === "orders",
  });
  const { data: inventory } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: inventoryAPI.list,
    enabled: panel === "inventory",
  });
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: authAPI.listUsers,
    enabled: panel === "users",
  });

  // Mutations
  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }) => crmAPI.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setActiveItem(null);
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => bookingAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const updateRentalMutation = useMutation({
    mutationFn: ({ id, status }) => rentalAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rentals"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }) => shopAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const addInventoryMutation = useMutation({
    mutationFn: (data) => inventoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      setAddInventoryOpen(false);
      setInventoryForm({
        name: "",
        sku: "",
        description: "",
        category: "Camera",
        type: "Rental",
        total_quantity: 1,
        price_per_day: 0,
        sale_price: 0,
      });
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: (id) => inventoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
    },
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: ({ userId, data }) => authAPI.updatePermissions(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setActiveItem(null);
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
      case "Active":
      case "Paid":
      case "Delivered":
      case "Won":
      case "Available":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {status}
          </span>
        );
      case "Pending":
      case "Contacted":
      case "New":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
            {status}
          </span>
        );
      case "Cancelled":
      case "Overdue":
      case "Failed":
      case "Lost":
      case "Maintenance":
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            {status}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      {/* Overview stats view */}
      {panel === "stats" && (
        <div className="space-y-8">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-panel h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Total Sales Revenue
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                      ${stats?.cards?.totalRevenue.toFixed(2)}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Photography Shoots
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                      {stats?.cards?.bookings}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Active Rentals
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                      {stats?.cards?.rentals}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Repeat className="h-5 w-5" />
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Stationery Orders
                    </p>
                    <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                      {stats?.cards?.orders}
                    </h3>
                  </div>
                  <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Chart panels */}
              <div className="glass-panel p-6 rounded-2xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">
                  Revenue Growth Timeline
                </h4>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.charts?.salesTimeline}>
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#4f46e5"
                            stopOpacity={0.2}
                          />
                          <stop
                            offset="95%"
                            stopColor="#4f46e5"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderColor: "#e2e8f0",
                          color: "#1e293b",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#6366f1"
                        fillOpacity={1}
                        fill="url(#colorRev)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* CRM leads view */}
      {panel === "crm" && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="font-bold text-slate-800 text-base mb-4">
            CRM Lead Pipeline Tracker
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Pipeline Notes</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Lead Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads?.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">
                        {lead.customer_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {lead.customer_email}
                      </p>
                    </td>
                    <td className="p-4 max-w-xs text-slate-600 truncate whitespace-pre-line">
                      {lead.notes}
                    </td>
                    <td className="p-4 text-slate-600">
                      {lead.agent_name || "Unassigned"}
                    </td>
                    <td className="p-4">{getStatusBadge(lead.lead_status)}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveItem(lead)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-[10px] font-bold text-indigo-600 shadow-xs cursor-pointer"
                      >
                        Edit Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings log management */}
      {panel === "bookings" && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="font-bold text-slate-800 text-base mb-4">
            Photography Bookings Manager
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service Package</th>
                  <th className="p-4">Shoot Date</th>
                  <th className="p-4">Assigned Staff</th>
                  <th className="p-4">Pricing</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings?.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800">
                      {b.customer_name}
                    </td>
                    <td className="p-4 text-slate-600">{b.service_type}</td>
                    <td className="p-4 text-slate-600">{b.booking_date}</td>
                    <td className="p-4 text-slate-600">
                      {b.photographer_name || "Unallocated"}
                    </td>
                    <td className="p-4 font-bold text-indigo-600">
                      ${b.total_price}
                    </td>
                    <td className="p-4">{getStatusBadge(b.status)}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() =>
                          updateBookingMutation.mutate({
                            id: b.id,
                            status: "Confirmed",
                          })
                        }
                        className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() =>
                          updateBookingMutation.mutate({
                            id: b.id,
                            status: "Completed",
                          })
                        }
                        className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold cursor-pointer"
                      >
                        Complete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rentals tracker management */}
      {panel === "rentals" && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="font-bold text-slate-800 text-base mb-4">
            Equipment Rentals Manager
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Renter</th>
                  <th className="p-4">Equipment Description</th>
                  <th className="p-4">Timeline</th>
                  <th className="p-4">Total Quote</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-semibold text-slate-800">
                      {r.customer_name}
                    </td>
                    <td className="p-4 text-slate-600">{r.equipment_name}</td>
                    <td className="p-4 text-slate-500">
                      {r.start_date} to {r.end_date}
                    </td>
                    <td className="p-4 font-bold text-indigo-600">
                      ${r.total_price.toFixed(2)}
                    </td>
                    <td className="p-4">{getStatusBadge(r.status)}</td>
                    <td className="p-4 text-right">
                      {r.status !== "Returned" && (
                        <button
                          onClick={() =>
                            updateRentalMutation.mutate({
                              id: r.id,
                              status: "Returned",
                            })
                          }
                          className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* E-Commerce Orders Manager (Admin Sub-View) */}
      {panel === "orders" && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="font-bold text-slate-800 text-base mb-4">
            E-Commerce Orders Manager
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Date Placed</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders?.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400">
                      No purchase orders placed yet.
                    </td>
                  </tr>
                ) : (
                  orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-700">
                        {order.id}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {order.customer_name || "Customer"}
                        </p>
                        <p className="text-[10px] text-slate-450 mt-0.5">
                          {order.customer_email}
                        </p>
                      </td>
                      <td className="p-4 max-w-xs truncate text-slate-600">
                        {order.items
                          ?.map((it) => `${it.product_name} x${it.quantity}`)
                          .join(", ")}
                      </td>
                      <td className="p-4 text-slate-600">{order.created_at}</td>
                      <td className="p-4 text-indigo-600 font-bold">
                        ${order.total_amount?.toFixed(2)}
                      </td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        {order.status === "Pending" && (
                          <button
                            onClick={() =>
                              updateOrderMutation.mutate({
                                id: order.id,
                                status: "Delivered",
                              })
                            }
                            className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold cursor-pointer"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status === "Pending" && (
                          <button
                            onClick={() =>
                              updateOrderMutation.mutate({
                                id: order.id,
                                status: "Cancelled",
                              })
                            }
                            className="px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 text-[9px] font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory control management */}
      {panel === "inventory" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-base">
              Central Inventory Database
            </h3>
            <button
              onClick={() => setAddInventoryOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Stock Item</span>
            </button>
          </div>

          <div className="glass-panel p-6 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-4">SKU / Item Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Stock Levels (Available / Total)</th>
                    <th className="p-4">Pricing</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                          {item.sku}
                        </p>
                      </td>
                      <td className="p-4 text-slate-600">{item.category}</td>
                      <td className="p-4 text-slate-600">{item.type}</td>
                      <td className="p-4 text-slate-600">
                        {item.available_quantity} / {item.total_quantity}
                      </td>
                      <td className="p-4 text-indigo-600 font-bold">
                        {item.type === "Rental"
                          ? `$${item.price_per_day}/day`
                          : `$${item.sale_price}`}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() =>
                            deleteInventoryMutation.mutate(item.id)
                          }
                          className="p-1.5 rounded border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:border-rose-200 transition-all cursor-pointer bg-white"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User permissions config */}
      {panel === "users" && (
        <div className="glass-panel p-6 rounded-2xl overflow-hidden">
          <h3 className="font-bold text-slate-800 text-base mb-4">
            User Roles & Access Directories
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="p-4">User details</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Capabilities Permissions List</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">
                        {u.first_name} {u.last_name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {u.email}
                      </p>
                    </td>
                    <td className="p-4 font-semibold text-indigo-600">
                      {u.role}
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-500 font-mono text-[10px]">
                      {u.permissions}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setActiveItem(u)}
                        className="px-3 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 hover:text-indigo-600 text-[10px] font-bold text-slate-600 transition-all cursor-pointer"
                      >
                        Modify Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modify user permissions dialog overlay */}
      {activeItem && panel === "users" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full border border-slate-200 relative shadow-2xl">
            <h3 className="font-bold text-slate-800 text-base mb-2">
              Modify Permissions
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Update capabilities array for user: {activeItem.email}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const role = formData.get("role");
                const perms = formData
                  .get("permissions")
                  .split(",")
                  .map((s) => s.trim());
                updatePermissionsMutation.mutate({
                  userId: activeItem.id,
                  data: { role, permissions: perms },
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  defaultValue={activeItem.role}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="Customer">Customer</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Rental Manager">Rental Manager</option>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Permissions Keys (comma separated)
                </label>
                <textarea
                  name="permissions"
                  defaultValue={JSON.parse(activeItem.permissions || "[]").join(
                    ", ",
                  )}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Save Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit CRM lead dialog overlay */}
      {activeItem && panel === "crm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full border border-slate-200 relative shadow-2xl">
            <h3 className="font-bold text-slate-800 text-base mb-2">
              Edit CRM Lead Stage
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Modify customer interest tags and update pipeline agent.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const lead_status = formData.get("lead_status");
                const notes = formData.get("notes");
                updateLeadMutation.mutate({
                  id: activeItem.id,
                  data: {
                    lead_status,
                    notes,
                    assigned_agent_id: activeItem.assigned_agent_id,
                  },
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Pipeline Stage
                </label>
                <select
                  name="lead_status"
                  defaultValue={activeItem.lead_status}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Interaction Notes
                </label>
                <textarea
                  name="notes"
                  defaultValue={activeItem.notes}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveItem(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Stock Item dialog overlay */}
      {addInventoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full border border-slate-200 relative shadow-2xl">
            <h3 className="font-bold text-slate-800 text-base mb-2">
              Add New Stock Item
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Create new stationery product listings or camera rental units.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addInventoryMutation.mutate(inventoryForm);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={inventoryForm.name}
                  onChange={(e) =>
                    setInventoryForm({ ...inventoryForm, name: e.target.value })
                  }
                  placeholder="e.g. Nikon Z6 Mirrorless"
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    required
                    value={inventoryForm.sku}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        sku: e.target.value,
                      })
                    }
                    placeholder="SKU-NIK-001"
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={inventoryForm.category}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Camera">Camera</option>
                    <option value="Lens">Lens</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Stationery">Stationery</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Allocation Type
                  </label>
                  <select
                    value={inventoryForm.type}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  >
                    <option value="Rental">Rental Gear</option>
                    <option value="Sale">Stationery Product</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Total Stock
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inventoryForm.total_quantity}
                    onChange={(e) =>
                      setInventoryForm({
                        ...inventoryForm,
                        total_quantity: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  value={inventoryForm.description}
                  onChange={(e) =>
                    setInventoryForm({
                      ...inventoryForm,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {inventoryForm.type === "Rental" ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Price per day
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inventoryForm.price_per_day}
                      onChange={(e) =>
                        setInventoryForm({
                          ...inventoryForm,
                          price_per_day: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Sale price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={inventoryForm.sale_price}
                      onChange={(e) =>
                        setInventoryForm({
                          ...inventoryForm,
                          sale_price: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setAddInventoryOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                >
                  Create Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
