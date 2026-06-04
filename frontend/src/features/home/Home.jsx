import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, ShoppingBag, Repeat, ArrowRight, Star, Heart, CheckCircle } from 'lucide-react';

export default function Home() {
  const [inquiry, setInquiry] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
    setInquiry({ name: '', email: '', message: '' });
  };

  const portfolios = [
    { title: 'The Highland Wedding', cat: 'Wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80' },
    { title: 'Golden Hour Fashion', cat: 'Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
    { title: 'Studio Monochromes', cat: 'Editorial', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.12),transparent_45%)]" />
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/20 mb-6">
            All-In-One Creative Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-indigo-200 to-indigo-500 bg-clip-text text-transparent">
            Capture. Create. Write.
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            A premium sanctuary combining professional photography services, cinema-grade camera rentals, and curated high-end stationery supplies.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/bookings"
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
            >
              Book Photography
            </Link>
            <Link
              to="/rentals"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-sm font-semibold text-slate-300 transition-all hover:scale-[1.02]"
            >
              Rent Equipment
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-4">Core Ecosystem</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Indulge in premium quality services designed to fuel your visual and physical art pipelines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="glass-panel p-8 rounded-2xl transition-all hover:border-indigo-500/40 group hover:translate-y-[-4px]">
              <div className="h-12 w-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/10">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Photography & Wedding Bookings</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Premium wedding coverages, model portfolio shoots, and custom corporate sessions captured by staff creators.
              </p>
              <Link to="/bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span>Check Availability</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Service 2 */}
            <div className="glass-panel p-8 rounded-2xl transition-all hover:border-indigo-500/40 group hover:translate-y-[-4px]">
              <div className="h-12 w-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/10">
                <Repeat className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Camera & Equipment Rentals</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Rent top-tier full-frame mirrorless camera bodies, cinema lenses, lighting systems, and essential production rigs.
              </p>
              <Link to="/rentals" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span>Browse Gear</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Service 3 */}
            <div className="glass-panel p-8 rounded-2xl transition-all hover:border-indigo-500/40 group hover:translate-y-[-4px]">
              <div className="h-12 w-12 rounded-xl bg-indigo-950 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/10">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Curated Stationery Shop</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                High-grade calligraphy sets, custom-bound leather journals, sketching pads, and writing tools shipped worldwide.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                <span>Shop Catalog</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Recent Portfolios</h2>
              <p className="text-slate-400 mt-2">A tiny glance at stories captured by our photographers.</p>
            </div>
            <Link to="/gallery" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1">
              <span>View Full Gallery</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {portfolios.map((item, idx) => (
              <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 mb-1">{item.cat}</span>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="py-24 border-t border-slate-900 bg-slate-950/40">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Have a Query?</h2>
            <p className="text-slate-400 text-xs text-center mb-6">Drop us a line and our team will get in touch within 24 hours.</p>

            {success ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>Thank you! Your message has been submitted. Our team will contact you shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={inquiry.name}
                    onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Email</label>
                  <input
                    type="email"
                    required
                    value={inquiry.email}
                    onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="jane@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={inquiry.message}
                    onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none"
                    placeholder="What are you looking for..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
