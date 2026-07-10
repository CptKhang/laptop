function HeroBanner() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071b4d] via-[#0b4fb3] to-[#0b7bdc] shadow-xl">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-white/10 blur-3xl" />

        <div className="relative grid min-h-[390px] grid-cols-2 items-center gap-8 px-12 py-10">
          <div className="text-white">
            <span className="mb-5 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
              Laptop Gaming Thế Hệ Mới
            </span>

            <h1 className="text-5xl font-extrabold leading-tight">
              Sức mạnh vượt trội. <br />
              Hiệu năng đỉnh cao.
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-blue-100">
              Khám phá các mẫu laptop cấu hình mạnh, thiết kế hiện đại,
              phù hợp cho học tập, làm việc và gaming.
            </p>

            <button className="mt-8 rounded-xl bg-white px-7 py-3 font-bold text-blue-700 shadow-lg transition hover:-translate-y-1 hover:bg-blue-50">
              Mua ngay →
            </button>
          </div>

          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-blue-300/30 blur-3xl" />
              <img
                src="https://cdn.tgdd.vn/Products/Images/44/309016/asus-tuf-gaming-f15-fx507zc4-i5-hn074w-1-750x500.jpg"
                alt="Laptop Gaming"
                className="relative z-10 w-[520px] rounded-xl drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroBanner;