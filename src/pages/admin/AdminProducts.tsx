import AdminLayout from "@/components/AdminLayout";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2, ImagePlus, X, Link, Upload } from "lucide-react";
import { toast } from "sonner";

const BUCKET = "product-images";

const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "", description: "", price: "", original_price: "", image_url: "",
    category_id: "", free_shipping: false, is_featured: false,
    is_new_arrival: false, is_best_seller: false, is_visible: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [bucketMissing, setBucketMissing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setUploadingImage(true);
    setBucketMissing(false);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        // Bucket doesn't exist — show instructions and switch to URL mode
        if (uploadError.message.toLowerCase().includes("bucket") || uploadError.statusCode === "404" || (uploadError as any).error === "Bucket not found") {
          setBucketMissing(true);
          setPreviewUrl("");
          setForm((prev) => ({ ...prev, image_url: "" }));
          toast.error("Storage bucket not found. See instructions below or use URL mode.");
          return;
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      setPreviewUrl(urlData.publicUrl);
      setBucketMissing(false);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      toast.error("Upload failed: " + (err.message || "Unknown error"));
      setPreviewUrl("");
      setForm((prev) => ({ ...prev, image_url: "" }));
    } finally {
      setUploadingImage(false);
    }
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) { toast.error("Please paste an image URL"); return; }
    setForm((prev) => ({ ...prev, image_url: trimmed }));
    setPreviewUrl(trimmed);
    toast.success("Image URL set!");
  };

  const clearImage = () => {
    setPreviewUrl("");
    setUrlInput("");
    setForm((prev) => ({ ...prev, image_url: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, categories(name)")
      .order("created_at", { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").order("display_order");
    setCategories(data || []);
  };

  useEffect(() => { fetchProducts(); fetchCategories(); }, []);

  const handleSubmit = async () => {
    if (!form.name)      { toast.error("Product name is required"); return; }
    if (!form.price)     { toast.error("Price is required"); return; }
    if (!form.image_url) { toast.error("Please add a product image or URL"); return; }
    if (uploadingImage)  { toast.error("Please wait for image to finish uploading"); return; }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      category_id: form.category_id || null,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) { toast.error("Failed to update: " + error.message); return; }
      toast.success("Product updated!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Failed to add: " + error.message); return; }
      toast.success("Product added!");
    }
    resetForm();
    fetchProducts();
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", original_price: "", image_url: "", category_id: "", free_shipping: false, is_featured: false, is_new_arrival: false, is_best_seller: false, is_visible: true });
    setPreviewUrl("");
    setUrlInput("");
    setBucketMissing(false);
    setEditingId(null);
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const editProduct = (p: any) => {
    setForm({
      name: p.name, description: p.description || "", price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      image_url: p.image_url, category_id: p.category_id || "",
      free_shipping: p.free_shipping, is_featured: p.is_featured,
      is_new_arrival: p.is_new_arrival, is_best_seller: p.is_best_seller, is_visible: p.is_visible
    });
    setPreviewUrl(p.image_url || "");
    setUrlInput("");
    setEditingId(p.id);
    setShowForm(true);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    fetchProducts();
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("products").update({ is_visible: !current }).eq("id", id);
    fetchProducts();
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Products ({products.length})</h2>
          <button
            onClick={() => { resetForm(); setShowForm(!showForm); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus className="w-3 h-3" /> Add Product
          </button>
        </div>

        {showForm && (
          <div className="bg-card rounded-xl border border-border p-4 space-y-3">
            <h3 className="text-sm font-bold">{editingId ? "Edit Product" : "Add Product"}</h3>

            <input
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="Product name *"
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              placeholder="Description"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} placeholder="Price (₹) *" type="number" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
              <input value={form.original_price} onChange={(e) => setForm({...form, original_price: e.target.value})} placeholder="Original Price" type="number" className="px-3 py-2 rounded-lg bg-secondary border border-border text-sm" />
            </div>

            {/* ─── Image Section ─────────────────────────── */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Product Image *</label>
                {/* Toggle between file upload and URL */}
                <div className="flex rounded-lg border border-border overflow-hidden text-[10px]">
                  <button
                    onClick={() => setUploadMode("file")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 font-semibold transition-colors ${uploadMode === "file" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </button>
                  <button
                    onClick={() => setUploadMode("url")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 font-semibold transition-colors ${uploadMode === "url" ? "gradient-primary text-primary-foreground" : "text-muted-foreground"}`}
                  >
                    <Link className="w-3 h-3" /> URL
                  </button>
                </div>
              </div>

              {/* Bucket missing warning */}
              {bucketMissing && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 space-y-1">
                  <p className="font-bold">⚠️ Storage bucket not found</p>
                  <p>To enable file uploads, create a bucket in Supabase:</p>
                  <ol className="list-decimal ml-4 space-y-0.5">
                    <li>Go to <strong>Supabase Dashboard → Storage</strong></li>
                    <li>Click <strong>"New bucket"</strong></li>
                    <li>Name it exactly: <code className="bg-amber-100 px-1 rounded">product-images</code></li>
                    <li>Enable <strong>"Public bucket"</strong> toggle</li>
                    <li>Click <strong>Save</strong></li>
                  </ol>
                  <p className="text-amber-600">Until then, use <strong>URL mode</strong> to paste an image link.</p>
                </div>
              )}

              {/* File upload mode */}
              {uploadMode === "file" && (
                <div
                  onClick={() => !uploadingImage && fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors cursor-pointer min-h-[100px] ${
                    uploadingImage ? "opacity-60 cursor-not-allowed" : "hover:border-primary/60 hover:bg-primary/5"
                  } ${previewUrl ? "border-primary/40 bg-primary/5 p-3" : "border-border p-6"}`}
                >
                  {previewUrl ? (
                    <div className="relative">
                      <img src={previewUrl} alt="Preview" className="w-28 h-28 object-cover rounded-lg shadow" />
                      {uploadingImage && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                          <Loader2 className="w-7 h-7 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {uploadingImage
                        ? <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                        : <ImagePlus className="w-8 h-8 text-muted-foreground mb-2" />}
                      <p className="text-xs text-muted-foreground">
                        {uploadingImage ? "Uploading…" : "Click to select image"}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">PNG, JPG, WEBP · max 5 MB</p>
                    </>
                  )}
                </div>
              )}

              {/* URL mode */}
              {uploadMode === "url" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="Paste image URL (https://...)"
                      className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
                      onKeyDown={(e) => e.key === "Enter" && applyUrl()}
                    />
                    <button
                      onClick={applyUrl}
                      className="px-3 py-2 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold"
                    >
                      Set
                    </button>
                  </div>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-border"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/96x96?text=Bad+URL"; }}
                    />
                  )}
                </div>
              )}

              {/* Common actions */}
              {previewUrl && !uploadingImage && (
                <button onClick={clearImage} className="flex items-center gap-1 text-xs text-destructive font-medium">
                  <X className="w-3 h-3" /> Remove image
                </button>
              )}
              {form.image_url && !uploadingImage && (
                <p className="text-[10px] text-green-600 font-semibold">✓ Image is ready</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploadingImage}
                className="hidden"
              />
            </div>
            {/* ─── End Image Section ──────────────────────── */}

            <select
              value={form.category_id}
              onChange={(e) => setForm({...form, category_id: e.target.value})}
              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            >
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <div className="flex flex-wrap gap-3">
              {[
                {key: "free_shipping",   label: "Free Ship"},
                {key: "is_featured",     label: "Featured"},
                {key: "is_new_arrival",  label: "New Arrival"},
                {key: "is_best_seller",  label: "Bestseller"},
              ].map(({key, label}) => (
                <label key={key} className="flex items-center gap-1.5 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(form as any)[key]}
                    onChange={(e) => setForm({...form, [key]: e.target.checked})}
                  />
                  {label}
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSubmit}
                disabled={uploadingImage}
                className="flex-1 py-2.5 rounded-lg gradient-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
              >
                {editingId ? "Update Product" : "Add Product"}
              </button>
              <button onClick={resetForm} className="px-4 py-2 rounded-lg border border-border text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No products yet. Add your first product!</div>
        ) : (
          products.map((p) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-3 flex gap-3">
              <img
                src={p.image_url}
                alt={p.name}
                className="w-16 h-16 rounded-lg object-cover bg-secondary flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/64x64?text=IMG"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.categories?.name || "No category"}</p>
                <p className="text-sm font-bold text-primary">₹{p.price}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {p.is_featured    && <span className="text-[9px] bg-accent px-1.5 py-0.5 rounded">Featured</span>}
                  {p.is_new_arrival && <span className="text-[9px] bg-accent px-1.5 py-0.5 rounded">New</span>}
                  {p.is_best_seller && <span className="text-[9px] bg-accent px-1.5 py-0.5 rounded">Best</span>}
                  {!p.is_visible    && <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">Hidden</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => editProduct(p)} className="p-1.5 rounded-lg hover:bg-accent">
                  <Edit2 className="w-3.5 h-3.5 text-primary" />
                </button>
                <button onClick={() => toggleVisibility(p.id, p.is_visible)} className="p-1.5 rounded-lg hover:bg-accent">
                  {p.is_visible
                    ? <Eye className="w-3.5 h-3.5 text-primary" />
                    : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </button>
                <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-accent">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
