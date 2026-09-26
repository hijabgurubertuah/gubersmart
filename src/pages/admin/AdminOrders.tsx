import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { Modal } from '../../components/ui/Modal';
import { Tooltip } from '../../components/ui/Tooltip';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Download,
  FileImage,
  ExternalLink,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, approveOrder, rejectOrder, products } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [productFilter, setProductFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (productFilter !== 'all' && o.productId !== productFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customerWhatsapp.includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Disetujui</span>
          </span>
        );
      case 'Menunggu Approval':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Menunggu Approval</span>
          </span>
        );
      case 'Menunggu Pembayaran':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-sky-600" />
            <span>Menunggu Bayar</span>
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Ditolak</span>
          </span>
        );
    }
  };

  const handleExportCSV = () => {
    const headers = 'ID,Produk,Pemesan,Email,WhatsApp,Harga,Status,Tanggal\n';
    const rows = filteredOrders
      .map(
        (o) =>
          `"${o.id}","${o.productName}","${o.customerName}","${o.customerEmail}","${o.customerWhatsapp}",${o.productPrice},"${o.status}","${o.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GuberSmart_Orders_${statusFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Pesanan & Approval Member"
          actionButton={
            <Tooltip content="Ekspor Daftar Pesanan Terfilter">
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
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Status Segmented Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto max-w-full">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({orders.length})
              </button>
              <button
                onClick={() => setStatusFilter('Menunggu Approval')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'Menunggu Approval'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggu Approval ({orders.filter((o) => o.status === 'Menunggu Approval').length})
              </button>
              <button
                onClick={() => setStatusFilter('Disetujui')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'Disetujui'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disetujui ({orders.filter((o) => o.status === 'Disetujui').length})
              </button>
              <button
                onClick={() => setStatusFilter('Menunggu Pembayaran')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === 'Menunggu Pembayaran'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggu Bayar ({orders.filter((o) => o.status === 'Menunggu Pembayaran').length})
              </button>
            </div>

            {/* Product & Search Inputs */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700"
              >
                <option value="all">Semua Produk</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama/email..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">
                Tidak ada data pesanan yang sesuai filter.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Pemesan</th>
                    <th className="py-3.5 px-4">Produk</th>
                    <th className="py-3.5 px-4">Total</th>
                    <th className="py-3.5 px-4">Bukti Transfer</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Tindakan Approval</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {order.customerEmail}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {order.customerWhatsapp}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 line-clamp-1 max-w-xs">
                          {order.productName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono-tabular">
                        {formatIDR(order.productPrice)}
                      </td>

                      <td className="py-3.5 px-4">
                        {order.paymentProofUrl ? (
                          <button
                            onClick={() => setSelectedProofOrder(order)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <FileImage className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Belum upload</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.status !== 'Disetujui' && (
                            <Tooltip content="Setujui Pembayaran & Buka Akses Member">
                              <button
                                onClick={() => approveOrder(order.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                            </Tooltip>
                          )}

                          {order.status !== 'Ditolak' && (
                            <Tooltip content="Tolak Pesanan Ini">
                              <button
                                onClick={() => {
                                  const reason = prompt('Masukkan alasan penolakan (opsional):');
                                  rejectOrder(order.id, reason || undefined);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-lg transition-colors cursor-pointer text-xs"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Proof Preview Modal */}
      <Modal
        isOpen={!!selectedProofOrder}
        onClose={() => setSelectedProofOrder(null)}
        title="Pratinjau Bukti Pembayaran"
        maxWidth="lg"
      >
        {selectedProofOrder && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Nama Pemesan:</span>
                <span className="font-bold text-slate-900">{selectedProofOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-800">{selectedProofOrder.customerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Produk:</span>
                <span className="font-medium text-slate-800">{selectedProofOrder.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nominal Transfer:</span>
                <span className="font-bold text-indigo-600 font-mono-tabular">
                  {formatIDR(selectedProofOrder.productPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nama File Drive:</span>
                <span className="font-mono text-slate-600 text-[11px]">
                  {selectedProofOrder.paymentProofFileName || `${selectedProofOrder.customerEmail}_bukti_bayar.jpg`}
                </span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-[4/3] flex items-center justify-center">
              <img
                src={selectedProofOrder.paymentProofUrl}
                alt="Bukti Transfer"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  const reason = prompt('Masukkan alasan penolakan:');
                  rejectOrder(selectedProofOrder.id, reason || undefined);
                  setSelectedProofOrder(null);
                }}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Tolak Pesanan
              </button>
              <button
                onClick={() => {
                  approveOrder(selectedProofOrder.id);
                  setSelectedProofOrder(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Setujui Pembayaran
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
