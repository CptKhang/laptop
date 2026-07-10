function Footer() {
    return (
      <footer className="bg-blue-50 border-t border-blue-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <div>
            <h3 className="text-lg font-extrabold text-blue-700">
              TechBlue Laptop
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              © 2026 TechBlue Việt Nam. Tất cả quyền được bảo lưu.
            </p>
          </div>
  
          <div className="flex gap-8 text-sm font-medium text-gray-600">
            <span className="cursor-pointer hover:text-blue-700">
              Chính sách bảo hành
            </span>
            <span className="cursor-pointer hover:text-blue-700">
              Hướng dẫn mua hàng
            </span>
            <span className="cursor-pointer hover:text-blue-700">
              Trợ giúp
            </span>
            <span className="cursor-pointer hover:text-blue-700">
              Liên hệ hỗ trợ
            </span>
          </div>
        </div>
      </footer>
    );
  }
  
  export default Footer;