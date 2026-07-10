const brands = ["DELL", "ASUS", "APPLE", "HP", "MSI", "LENOVO"];

function BrandList() {
  return (
    <section className="mx-auto mt-12 max-w-7xl px-6">
      <div className="rounded-2xl bg-white px-8 py-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand) => (
            <button
              key={brand}
              className="rounded-xl border border-gray-100 bg-gray-50 py-4 text-lg font-extrabold tracking-widest text-gray-400 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {brand}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BrandList;