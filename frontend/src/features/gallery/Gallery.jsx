import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { galleryAPI } from '../../services/api.js';
import Navbar from '../../layouts/Navbar.jsx';
import { Sparkles, Camera, Plus, Trash2, Loader, AlertCircle } from 'lucide-react';

export default function Gallery() {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSelector(state => state.auth);

  const [activeTag, setActiveTag] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    tagsString: ''
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ['gallery', activeTag],
    queryFn: () => galleryAPI.list(activeTag)
  });

  const uploadMutation = useMutation({
    mutationFn: (imageData) => galleryAPI.create(imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
      setOpenModal(false);
      setForm({ title: '', description: '', imageUrl: '', tagsString: '' });
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to upload portfolio metadata.');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => galleryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    }
  });

  const tags = ['', 'wedding', 'beach', 'sunset', 'portrait', 'studio', 'lights', 'nature'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.imageUrl) {
      setErrorMsg('Title and Image URL are required.');
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      imageUrl: form.imageUrl,
      tags: form.tagsString.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
      dimensions: { width: 1200, height: 800 },
      sizeBytes: 480000
    };

    uploadMutation.mutate(payload);
  };

  const isPhotographer = user && ['Photographer', 'Admin', 'Super Admin'].includes(user.role);

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-indigo-500" />
              <h2 className="text-2xl font-bold tracking-tight text-white">Our Creative Portfolios</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">High-end shoots captured on-location and inside our custom-designed studios.</p>
          </div>

          <div className="flex gap-2">
            {isPhotographer && (
              <button
                onClick={() => setOpenModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Upload Shoot</span>
              </button>
            )}
          </div>
        </div>

        {/* Tag Filters list menu */}
        <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto pb-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                activeTag === tag
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {tag === '' ? 'Show All' : '#' + tag}
            </button>
          ))}
        </div>

        {/* Portfolios Image Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel h-80 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {images?.map((item) => (
              <div key={item._id} className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden group relative">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Information Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <div className="flex gap-1.5 flex-wrap mb-2">
                    {item.tags?.map(t => (
                      <span key={t} className="text-[8px] uppercase font-bold bg-indigo-950/80 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/10">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  
                  {isPhotographer && (
                    <button
                      onClick={() => deleteMutation.mutate(item._id)}
                      className="absolute top-4 right-4 p-2 bg-slate-950/70 border border-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add portfolio photo modal popup */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 max-w-md w-full relative">
            <h3 className="font-bold text-white text-base mb-2">Upload New Portfolio Shoot</h3>
            <p className="text-xs text-slate-400 mb-6">Upload media references and tags metadata to the public galleries.</p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Vintage Couple Portraits"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details about shoot concept..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Image URL (Unsplash or direct link)</label>
                <input
                  type="url"
                  required
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={form.tagsString}
                  onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
                  placeholder="wedding, sunset, nature"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                >
                  {uploadMutation.isPending && <Loader className="h-4 w-4 animate-spin" />}
                  <span>Upload</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
