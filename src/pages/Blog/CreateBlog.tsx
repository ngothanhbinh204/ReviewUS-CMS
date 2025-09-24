import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "ckeditor5-build-classic-dna";

export default function AddPostPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [excerpt, setExcerpt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [status, setStatus] = useState("draft");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tạo bài viết mới</h1>
          <div className="flex gap-3">
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              Xem trước
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
              Lưu nháp
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Xuất bản
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section */}
            <div className="bg-white rounded-2xl shadow p-6">
              <input
                type="text"
                className="w-full text-3xl font-bold border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                placeholder="Nhập tiêu đề bài viết..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Editor Section */}
            <div className="bg-white rounded-2xl shadow p-6">
              <CKEditor
                editor={ClassicEditor}
                data={content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setContent(data);
                }}
              
              />
            </div>

            {/* Excerpt Section */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Tóm tắt bài viết</h2>
              <textarea
                className="w-full h-32 rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tóm tắt bài viết..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publication Settings */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                Thiết lập xuất bản
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="published">Xuất bản</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày xuất bản
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                Phân loại
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">-- Chọn danh mục --</option>
                    <option value="du-lich">Du lịch</option>
                    <option value="am-thuc">Ẩm thực</option>
                    <option value="review">Review</option>
                    <option value="tin-tuc">Tin tức</option>
                    <option value="kinh-nghiem">Kinh nghiệm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="Nhập tags, cách nhau bằng dấu phẩy"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                Ảnh đại diện
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {featuredImage ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(featuredImage)}
                      alt="Preview"
                      className="max-w-full h-auto rounded"
                    />
                    <button
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                      onClick={() => setFeaturedImage(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="featured-image"
                      onChange={(e) => setFeaturedImage(e.target.files[0])}
                    />
                    <label
                      htmlFor="featured-image"
                      className="cursor-pointer text-blue-600 hover:text-blue-700"
                    >
                      Chọn ảnh đại diện
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                SEO
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    className="w-full h-24 rounded-lg border border-gray-300 px-3 py-2"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
