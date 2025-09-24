import { Outlet } from "react-router-dom";

export default function BlogLayout() {
  return (
    <div className="blog-layout">
      {/* Sidebar hoặc Navbar riêng cho blog (nếu cần) */}
      <h2>Blog Management</h2>
      <Outlet />
    </div>
  );
}
