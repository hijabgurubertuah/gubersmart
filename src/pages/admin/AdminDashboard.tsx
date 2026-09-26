import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import {
  DollarSign,
  Users,
  Clock,
  Package,
  ArrowUpRight,
  Download,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';
import { Tooltip } from '../../components/ui/Tooltip';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    orders,
    approveOrder,
    rejectOrder,
    navigate,
    totalPendingApprovals,
  } = useApp();

  // Metrics
  const approvedOrders = orders.filter((o) => o.status === 'Disetujui');
  const totalRevenue = approvedOrders.reduce((acc, curr) => acc + (curr.productPrice || 0), 0);
  const activeMembersCount = new Set(approvedOrders.map((o) => o.customerEmail)).size;
  const publishedProductsCount = products.filter((p) => p.status === 'Tayang').length;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'ID,Produk,Pemesan,Email,WhatsApp,Harga,Status,Tanggal\n';
    const rows = orders
      .map(
        (o) =>
          `"${o.id}","${o.productName}","${o.customerName}","${o.customerEmail}","${o.customerWhatsapp}",${o.productPrice},"${o.status}","${o.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GuberSmart_Pesanan_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Dashboard Ringkasan"
          actionButton={
            <Tooltip content="Unduh Rekap Pesanan (Format CSV)">
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Ekspor CSV</span>
              </button>
            </Tooltip>
          }
        />

        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Estimasi Pendapatan</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 font-mono-tabular">
                {formatIDR(totalRevenue)}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {approvedOrders.length} transaksi disetujui
              </div>
            </div>

            {/* Active Members */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Member Aktif</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 font-mono-tabular">
                {activeMembersCount}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium">
                Akses terverifikasi
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Menunggu Approval</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 font-mono-tabular">
                {totalPendingApprovals}
              </div>
              <div className="mt-1 text-[11px] text-amber-600 font-medium">
                {totalPendingApprovals > 0 ? 'Perlu tindakan verifikasi' : 'Semua terverifikasi'}
              </div>
            </div>

            {/* Published Products */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Produk Tayang</span>
                <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 font-mono-tabular">
                {publishedProductsCount} <span className="text-sm font-normal text-slate-400">/ {products.length}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Katalog publik aktif
              </div>
            </div>
          </div>

          {/* Orders Volume per Product Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Pesanan per Produk</h3>
                <span className="text-xs text-slate-500">Total pesanan masuk keseluruhan</span>
              </div>
              <button
                onClick={() => navigate('/admin/pesanan')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
              >
                <span>Kelola Semua Pesanan</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {products.map((prod) => {
                const prodOrders = orders.filter((o) => o.productId === prod.id);
                const approvedCount = prodOrders.filter((o) => o.status === 'Disetujui').length;
                const pendingCount = prodOrders.filter((o) => o.status === 'Menunggu Approval').length;
                const percentage = Math.round((prodOrders.length / (orders.length || 1)) * 100);

                return (
                  <div key={prod.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
                        {prod.name}
                      </span>
                      <div className="flex items-center gap-3 font-mono-tabular text-[11px] text-slate-500">
                        <span>{prodOrders.length} Pesanan</span>
                        <span className="text-emerald-600">{approvedCount} Disetujui</span>
                        {pendingCount > 0 && (
                          <span className="text-amber-600 font-bold">{pendingCount} Pending</span>
                        )}
                      </div>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Approval Priority List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Antrean Verifikasi Bukti Transfer
                </h3>
                <span className="text-xs text-slate-500">
                  Pesanan menunggu persetujuan admin untuk membuka akses member
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/pesanan')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                Lihat Semua
              </button>
            </div>

            {orders.filter((o) => o.status === 'Menunggu Approval').length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Tidak ada antrean pesanan yang menunggu approval saat ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders
                  .filter((o) => o.status === 'Menunggu Approval')
                  .slice(0, 5)
                  .map((order) => (
                    <div
                      key={order.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="flex items-center gap-2 text-slate-500 font-mono-tabular text-[11px] mt-0.5">
                          <span>{order.customerEmail}</span>
                          <span aria-hidden="true">·</span>
                          <span>{order.productName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-600">
                            {formatIDR(order.productPrice)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {order.paymentProofUrl && (
                          <Tooltip content="Lihat Foto Bukti Transfer">
                            <a
                              href={order.paymentProofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          </Tooltip>
                        )}

                        <Tooltip content="Setujui & Buka Akses Member">
                          <button
                            onClick={() => approveOrder(order.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Setujui</span>
                          </button>
                        </Tooltip>

                        <Tooltip content="Tolak Pesanan">
                          <button
                            onClick={() => rejectOrder(order.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
