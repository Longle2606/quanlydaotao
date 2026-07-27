import React, { useState } from 'react';
import { GraduationCap, Lock, User, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }
    if (!password.trim()) {
      setError('Vui lòng nhập mật khẩu');
      return;
    }

    setIsLoading(true);

    // Simulate quick authentication check
    setTimeout(() => {
      setIsLoading(false);
      // Allow demo login
      onLoginSuccess(username.trim());
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    setUsername('admin');
    setPassword('admin123');
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess('Quản trị viên');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Visual Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-sky-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner mb-3">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Hệ Thống Đào Tạo & Bồi Dưỡng</h1>
            <p className="text-xs text-indigo-100/80 mt-1 font-medium">Quản lý Nhân sự & Chương trình Đào tạo</p>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-slate-900">Đăng Nhập Hệ Thống</h2>
            <p className="text-xs text-slate-500">Vui lòng nhập tài khoản và mật khẩu để truy cập</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tên Đăng Nhập *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập (VD: admin)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật Khẩu *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu (VD: admin123)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-3 rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>Vào Hệ Thống</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-2 border border-slate-200"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Đăng Nhập Nhanh (Quyền Quản Trị)</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
          Phòng Kế hoạch Tổng hợp / Đào tạo & Bồi dưỡng © 2026
        </div>
      </div>
    </div>
  );
};
