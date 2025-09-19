import React, { useState, useEffect } from "react";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    kodeBarang: "",
    namaBarang: "",
    satuan: "",
    stockAwal: 0,
  });
  const [modalAdd, setModalAdd] = useState(false);
  const [modalTrans, setModalTrans] = useState({
    open: false,
    item: null,
    type: "",
  });
  const [transAmount, setTransAmount] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");

  // Fetch semua item
  const getAllItems = async () => {
    try {
      const res = await fetch(
        "https://wms-backend-production.up.railway.app/api/inventory"
      );
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getAllItems();
  }, []);

  // Tambah item
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await fetch(
        "https://wms-backend-production.up.railway.app/api/inventory",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, stockAwal: Number(form.stockAwal) }),
        }
      );
      setForm({ kodeBarang: "", namaBarang: "", satuan: "", stockAwal: 0 });
      setModalAdd(false);
      getAllItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Edit item
  const startEdit = (item) => {
    setEditingId(item._id);
    setEditForm({ ...item });
  };

  const saveEdit = async () => {
    try {
      await fetch(
        `https://wms-backend-production.up.railway.app/api/inventory/${editingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
        }
      );
      setEditingId(null);
      getAllItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete item
  const handleDelete = async (id) => {
    if (!window.confirm("Hapus item ini?")) return;
    try {
      await fetch(
        `https://wms-backend-production.up.railway.app/api/inventory/${id}`,
        {
          method: "DELETE",
        }
      );
      getAllItems();
    } catch (err) {
      console.error(err);
    }
  };

  // Transaksi Masuk/Keluar
  const handleTrans = async () => {
    if (transAmount <= 0) return alert("Jumlah harus > 0");
    const payload =
      modalTrans.type === "masuk"
        ? { stockMasuk: transAmount }
        : { stockKeluar: transAmount };
    try {
      await fetch(
        `https://wms-backend-production.up.railway.app/api/inventory/${modalTrans.item._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setModalTrans({ open: false, item: null, type: "" });
      setTransAmount(0);
      getAllItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4 mt-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <button
          onClick={() => setModalAdd(true)}
          className="bg-blue-500 px-4 py-2 text-white rounded"
        >
          Tambah Barang
        </button>
      </div>

      {/* Search */}
      <input
        placeholder="Search..."
        className="w-full p-2 border rounded mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="overflow-x-auto shadow rounded">
        <table className="min-w-full table-auto bg-white">
          <thead className="bg-gray-100">
            <tr>
              {[
                "No",
                "Kode",
                "Nama",
                "Satuan",
                "Stock Awal",
                "Masuk",
                "Keluar",
                "Total",
                "Action",
              ].map((h, i) => (
                <th key={i} className="border px-4 py-2 text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items
              .filter(
                (it) =>
                  it.namaBarang.toLowerCase().includes(search.toLowerCase()) ||
                  it.kodeBarang.toLowerCase().includes(search.toLowerCase())
              )
              .map((it, i) => (
                <tr key={it._id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 text-center">{i + 1}</td>
                  {["kodeBarang", "namaBarang", "satuan", "stockAwal"].map(
                    (f) => (
                      <td key={f} className="border px-4 py-2 text-center">
                        {editingId === it._id ? (
                          <input
                            className="w-full p-1 border rounded text-sm"
                            value={editForm[f]}
                            onChange={(e) =>
                              setEditForm({ ...editForm, [f]: e.target.value })
                            }
                          />
                        ) : (
                          it[f]
                        )}
                      </td>
                    )
                  )}
                  <td className="border px-4 py-2 text-center">
                    {it.stockMasuk}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {it.stockKeluar}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {it.stockAwal + it.stockMasuk - it.stockKeluar}
                  </td>
                  <td className="border px-4 py-2 text-center  flex flex-wrap justify-center gap-1">
                    {editingId === it._id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="bg-green-500 px-2 py-1 text-white rounded text-sm"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-400 px-2 py-1 text-white rounded text-sm"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(it)}
                          className="bg-yellow-400 px-2 py-1 text-white rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            setModalTrans({
                              open: true,
                              item: it,
                              type: "masuk",
                            })
                          }
                          className="bg-green-500 px-2 py-1 text-white rounded text-sm"
                        >
                          Masuk
                        </button>
                        <button
                          onClick={() =>
                            setModalTrans({
                              open: true,
                              item: it,
                              type: "keluar",
                            })
                          }
                          className="bg-red-500 px-2 py-1 text-white rounded text-sm"
                        >
                          Keluar
                        </button>
                        <button
                          onClick={() => handleDelete(it._id)}
                          className="bg-gray-400 px-2 py-1 text-white rounded text-sm"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add */}
      {modalAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tambah Barang</h2>
            <form className="space-y-2" onSubmit={handleAdd}>
              {["kodeBarang", "namaBarang", "satuan", "stockAwal"].map((f) => (
                <input
                  key={f}
                  placeholder={f}
                  type={f === "stockAwal" ? "number" : "text"}
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              ))}
              <div className="flex justify-end space-x-2 mt-4 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                  onClick={() => setModalAdd(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Trans */}
      {modalTrans.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-2">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {modalTrans.type === "masuk" ? "Stock Masuk" : "Stock Keluar"}
            </h2>
            <input
              type="number"
              min={1}
              placeholder="Jumlah"
              value={transAmount}
              onChange={(e) => setTransAmount(Number(e.target.value))}
              className="w-full p-2 border rounded mb-4"
            />
            <h3 className="font-bold mb-2">
              Riwayat {modalTrans.type === "masuk" ? "Masuk" : "Keluar"}
            </h3>
            <ul className="max-h-40 overflow-y-auto border p-2 mb-4">
              {(modalTrans.type === "masuk"
                ? modalTrans.item.historyMasuk
                : modalTrans.item.historyKeluar || []
              ).map((h, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b py-1 text-sm"
                >
                  <span>{new Date(h.tanggal).toLocaleString()}</span>
                  <span>{h.jumlah}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-end space-x-2 flex-wrap">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded"
                onClick={() =>
                  setModalTrans({ open: false, item: null, type: "" })
                }
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={handleTrans}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
