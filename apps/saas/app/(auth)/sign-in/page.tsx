import React from 'react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      {/* Arka Plan Efekti */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)0%,rgba(0,0,0,1)100%)]" />
      
      <div className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 p-10 rounded-[2rem] shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tighter">RGZTEC <span className="text-blue-500">SaaS</span></h1>
          <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-bold">Yönetici Girişi</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">E-Posta Adresi</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all"
              placeholder="admin@mağaza.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Şifre</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
            Sisteme Giriş Yap
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-xs">
          90 Mağaza Yetki Kontrolü Aktif • RGZ v1.0
        </p>
      </div>
    </div>
  );
}
