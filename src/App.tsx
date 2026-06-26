import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number | null;
};

type SortField = "make" | "model" | "year" | "price";
type SortDir = "asc" | "desc";

const vehicles: Vehicle[] = [
  { id: 1, make: "Toyota", model: "Corolla", year: 2015, price: null },
  { id: 2, make: "Jeep", model: "Wrangler", year: 2019, price: 30000 },
  { id: 3, make: "Audi", model: "A4", year: 2017, price: 25000 },
  { id: 4, make: "Jeep", model: "Cherokee", year: 2020, price: null },
  { id: 5, make: "BMW", model: "X3", year: 2018, price: 37000 },
];

const fetchVehicles = (): Promise<Vehicle[]> =>
  new Promise((resolve) => setTimeout(() => resolve(vehicles), 1000));

export default function VehicleList() {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("year");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  useEffect(() => {
    fetchVehicles().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredVehicles = useMemo(() => {
    const search = filter.toLowerCase().trim();
    const filtered = items.filter((v) =>
      [v.make, v.model, String(v.year), v.price == null ? "no price" : String(v.price)].some(
        (s) => s.toLowerCase().includes(search)
      )
    );
    return [...filtered].sort((a, b) => {
      const av = sortField === "price" ? (a.price ?? Infinity) : a[sortField];
      const bv = sortField === "price" ? (b.price ?? Infinity) : b[sortField];
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [items, filter, sortField, sortDir]);

  const handleEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditPrice(vehicle.price === null ? "" : String(vehicle.price));
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice("");
  };

  const handleSave = (id: number) => {
    const parsedPrice = editPrice.trim() === "" ? null : Number(editPrice);
    if (parsedPrice !== null && Number.isNaN(parsedPrice)) return;
    setItems((prev) =>
      prev.map((v) => (v.id === id ? { ...v, price: parsedPrice } : v))
    );
    handleCancel();
  };

  if (loading) {
    return (
      <div className="vl-loading">
        <span className="vl-spinner" />
        Loading vehicles…
      </div>
    );
  }

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      <span className="vl-sort-icon">{sortDir === "asc" ? "↑" : "↓"}</span>
    ) : (
      <span className="vl-sort-icon muted">↕</span>
    );

  return (
    <section className="vl-shell">
      <div className="vl-toolbar">
        <div className="vl-search-wrap">
          <span className="vl-search-icon">🔍</span>
          <input
            className="vl-search"
            type="search"
            placeholder="Search make, model, year or price…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="vl-badges">
          <span className="vl-badge">{filteredVehicles.length} vehicles</span>
          <span className="vl-badge warn">
            {items.filter((v) => v.price === null).length} missing price
          </span>
        </div>
      </div>

      <div className="vl-table-wrap">
        <table className="vl-table">
          <thead>
            <tr>
              {(["make", "model", "year", "price"] as SortField[]).map((f) => (
                <th key={f} onClick={() => handleSort(f)} className="sortable">
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                  <SortIcon field={f} />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((vehicle) => {
              const isEditing = editingId === vehicle.id;
              return (
                <tr key={vehicle.id} className={isEditing ? "editing" : ""}>
                  <td>{vehicle.make}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.year}</td>
                  <td>
                    {isEditing ? (
                      <input
                        className="vl-price-input"
                        type="number"
                        value={editPrice}
                        placeholder="Enter price"
                        onChange={(e) => setEditPrice(e.target.value)}
                        autoFocus
                      />
                    ) : vehicle.price === null ? (
                      <span className="vl-badge warn">No price</span>
                    ) : (
                      <span className="vl-price">${vehicle.price.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="vl-actions">
                    {isEditing ? (
                      <>
                        <button className="vl-btn primary" onClick={() => handleSave(vehicle.id)}>Save</button>
                        <button className="vl-btn ghost" onClick={handleCancel}>Cancel</button>
                      </>
                    ) : (
                      <button className="vl-btn ghost" onClick={() => handleEdit(vehicle)}>Edit price</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredVehicles.length === 0 && (
        <p className="vl-empty">No vehicles match your search.</p>
      )}
    </section>
  );
}