

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, ShoppingBag, Repeat, ArrowRight, CheckCircle, Search, Calendar, ChevronDown } from 'lucide-react';
import Navbar from '../../layouts/Navbar.jsx';

export default function Home() {
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(false);
  
  // Hero Search Widget State
  const [searchService, setSearchService] = useState('bookings'); // 'bookings', 'rentals', 'shop'
  const [searchDate, setSearchDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
    setInquiry({ name: '', email: '', message: '' });
  };

  const handleHeroSearchSubmit = (e) => {
    e.preventDefault();
    if (searchService === 'bookings') {
      navigate('/bookings');
    } else if (searchService === 'rentals') {
      navigate('/rentals');
    } else {
      navigate('/shop');
    }
  };

  const portfolios = [
    { title: 'The Highland Wedding', cat: 'Wedding', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80' },
    { title: 'Golden Hour Fashion', cat: 'Portrait', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80' },
    { title: 'Studio Monochromes', cat: 'Editorial', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80' }
  ];

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[650px] flex items-center justify-center overflow-hidden">
          {/* Background Image with Dark Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1920&q=80')` 
            }}
          />
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />

          {/* Hero Content */}
          <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 -mt-10">
            {/* Pill Badge */}
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-600 text-white mb-6 shadow-md shadow-indigo-600/20">
              The Ultimate Photography Experience
            </span>
            
            {/* Serif Title */}
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 font-serif leading-tight">
              Discover Your Perfect Visual Story
            </h1>
            
            <p className="max-w-2xl mx-auto text-base md:text-lg text-slate-200 mb-12 leading-relaxed">
              A premium sanctuary combining professional photography services, cinema-grade camera rentals, and curated high-end stationery supplies.
            </p>

            {/* QuickStay-like Search Bar Widget */}
            <div className="max-w-4xl mx-auto bg-white rounded-2xl lg:rounded-full shadow-2xl p-4 lg:py-3 lg:px-6 border border-slate-100 text-left">
              <form onSubmit={handleHeroSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                
                {/* Search Service Selector */}
                <div className="flex-1 w-full border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 lg:pr-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Service
                  </label>
                  <div className="relative">
                    <select
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      className="w-full bg-transparent font-semibold text-slate-700 text-sm focus:outline-none appearance-none cursor-pointer pr-6"
                    >
                      <option value="bookings">Photography Shoot Booking</option>
                      <option value="rentals">Camera & Gear Rentals</option>
                      <option value="shop">Curated Stationery Shop</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-slate-400 absolute right-0 top-0.5 pointer-events-none" />
                  </div>
                </div>

                {/* Target Date */}
                <div className="flex-1 w-full border-b lg:border-b-0 lg:border-r border-slate-100 pb-3 lg:pb-0 lg:px-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Start / Target Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full bg-transparent font-semibold text-slate-700 text-sm focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* End Date Placeholder */}
                <div className="flex-1 w-full pb-3 lg:pb-0 lg:px-4">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    End Date (For Rentals)
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      className="w-full bg-transparent font-semibold text-slate-700 text-sm focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Search Action Button */}
                <button
                  type="submit"
                  className="w-full lg:w-auto px-8 py-3.5 rounded-xl lg:rounded-full bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-all shadow-md shadow-indigo-600/20 hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </button>

              </form>
            </div>

          </div>
        </section>

        {/* Core Ecosystem Section */}
        <section className="py-24 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                Core Ecosystem
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl mt-4 mb-4">
                Sanjay Studios Services
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto text-sm">
                Indulge in premium quality services designed to fuel your visual and physical art pipelines.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Service 1 */}
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl transition-all hover:border-indigo-200 group hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Photography Bookings</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Premium wedding coverages, model portfolio shoots, and custom corporate sessions captured by staff creators.
                </p>
                <Link to="/bookings" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-500">
                  <span>Check Availability</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Service 2 */}
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl transition-all hover:border-indigo-200 group hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                  <Repeat className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Camera & Equipment Rentals</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Rent top-tier full-frame mirrorless camera bodies, cinema lenses, lighting systems, and essential production rigs.
                </p>
                <Link to="/rentals" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-500">
                  <span>Browse Gear</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Service 3 */}
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-2xl transition-all hover:border-indigo-200 group hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6 border border-indigo-100">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-800">Curated Stationery Shop</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  High-grade calligraphy sets, custom-bound leather journals, sketching pads, and writing tools shipped worldwide.
                </p>
                <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-500">
                  <span>Shop Catalog</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Showcase Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block mb-2">Our Work</span>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight font-serif">Recent Portfolios</h2>
                <p className="text-slate-500 mt-2 text-sm">A tiny glance at stories captured by our photographers.</p>
              </div>
              <Link to="/gallery" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 inline-flex items-center gap-1">
                <span>View Full Gallery</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {portfolios.map((item, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-white">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent flex flex-col justify-end p-6">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 mb-1">{item.cat}</span>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form Section */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-md">
              <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center font-serif">Have a Query?</h2>
              <p className="text-slate-500 text-xs text-center mb-6">Drop us a line and our team will get in touch within 24 hours.</p>

              {success ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
                  <span>Thank you! Your message has been submitted. Our team will contact you shortly.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      value={inquiry.name}
                      onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Your Email</label>
                    <input
                      type="email"
                      required
                      value={inquiry.email}
                      onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={inquiry.message}
                      onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="What are you looking for..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* QuickStay style Footer */}
      <footer className="bg-[#0B1528] text-slate-300 border-t border-slate-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Column 1: Logo, Desc, Socials */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-xl tracking-wider">
                <Camera className="h-6 w-6 text-indigo-500 stroke-[2.5]" />
                <span>APEX<span className="text-indigo-400">STUDIOS</span></span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed">
                Discover the world's most extraordinary artistic perspectives — from custom portrait photography to cinema-grade cameras and journals.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded-full transition-all text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded-full transition-all text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded-full transition-all text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                  </svg>
                </a>
                <a href="#" className="p-2 bg-slate-800/60 hover:bg-indigo-600 hover:text-white rounded-full transition-all text-slate-400">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Company */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 font-serif">Company</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Partners</a></li>
              </ul>
            </div>

            {/* Column 3: Support */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 font-serif">Support</h4>
              <ul className="space-y-4 text-sm font-semibold">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Safety Information</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Cancellation Options</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Accessibility</a></li>
              </ul>
            </div>

            {/* Column 4: Newsletter Stay Updated */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6 font-serif">Stay Updated</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Subscribe to our newsletter for visual inspiration, equipment tips, and exclusive offers.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 pr-12"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 bg-white text-slate-900 p-2 rounded-md hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Bottom Footer Credits */}
          <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-semibold">
            <span>© 2026 Apex Studios. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
