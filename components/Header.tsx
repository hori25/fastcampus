'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type AuthMode = 'login' | 'signup' | null;

type FormData = {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Supabase 설정 확인
    if (!isSupabaseConfigured()) {
      alert('Supabase 설정이 필요합니다. .env.local 파일을 확인해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (authMode === 'signup') {
        // 회원가입 로직
        if (formData.password !== formData.confirmPassword) {
          alert('비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }

        // 비밀번호 해싱 (bcrypt 대신 간단한 방법)
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              name: formData.name,
              email: formData.email,
              password_hash: formData.password, // 실제로는 백엔드에서 해싱해야 함
            }
          ])
          .select();

        if (error) {
          if (error.code === '23505') { // unique violation
            alert('이미 존재하는 이메일입니다.');
          } else {
            alert('회원가입 실패: ' + error.message);
          }
          setIsLoading(false);
          return;
        }

        // 회원가입 성공
        setToastMessage('Registration completed!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setTimeout(() => {
            handleModalClose();
          }, 300); // 토스트가 사라진 후 모달 닫기
        }, 1000);

      } else {
        // 로그인 로직
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .eq('password_hash', formData.password)
          .single();

        if (error || !data) {
          alert('아이디 또는 비밀번호가 일치하지 않습니다.');
          setIsLoading(false);
          return;
        }

        // 로그인 성공
        setToastMessage('Login successful!');
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setTimeout(() => {
            handleModalClose();
          }, 300);
        }, 1000);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleModalClose = () => {
    setAuthMode(null);
    resetForm();
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-500 ${
          isScrolled
            ? 'bg-transparent border-transparent backdrop-blur-none'
            : 'bg-white/95 backdrop-blur-sm border-black/5'
        }`}
      >
        <div className="section-shell">
          <div className="grid grid-cols-12 items-center gap-[10px] py-2">
            <nav className="col-span-4 flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] text-ink">
              <a href="/shop" className="transition-opacity hover:opacity-60">
                Shop
              </a>
              <a href="/offline-store" className="transition-opacity hover:opacity-60">
                Offline Store
              </a>
            </nav>

            <div className="col-span-4 flex justify-center">
              <a href="/" className="transition-opacity hover:opacity-80">
                <Image
                  src="/assets/logo.svg"
                  alt="BYREDO"
                  width={80}
                  height={18}
                  className="h-auto w-[80px]"
                  priority
                />
              </a>
            </div>

            <div className="col-span-4 flex items-center justify-end gap-6 text-[11px] uppercase tracking-[0.2em] text-ink">
              <a href="/mypage" className="transition-opacity hover:opacity-60">
                My Page
              </a>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="transition-opacity hover:opacity-60"
              >
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className="transition-opacity hover:opacity-60"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
      </header>

      {authMode && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm overflow-hidden"
          onClick={handleModalClose}
        >
          <div 
            className="relative w-full max-w-[640px] h-[85vh] mx-4 bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - 고정 헤더 영역 */}
            <div className="absolute right-4 top-4 z-10">
              <button
                type="button"
                onClick={handleModalClose}
                className="text-sm text-black/50 hover:text-black"
              >
                ✕
              </button>
            </div>

            {/* 스크롤 가능한 컨텐츠 영역 */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pt-4 pb-16 sm:px-6 sm:pt-6 sm:pb-20">
              <div className="mx-auto max-w-[608px]">
                <h2 className="font-['sk-modernist'] text-[44px] font-bold leading-[1.2] text-[#121212]">
                  {authMode === 'login' ? 'Greetings! Welcome to' : 'Create your account for'}
                  <br />
                  byredo.
                </h2>

                {authMode === 'login' && (
                  <>
                    {/* ID 입력 */}
                    <div className="mt-10 space-y-2">
                      <label className="block text-[13px] font-medium tracking-[0.08em] text-[#121212]">
                        ID
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-[2.5rem] w-full border border-[#d2d2d7] bg-white px-4 text-[14px] outline-none transition focus:border-black"
                        placeholder=""
                      />
                    </div>

                    {/* PASSWORD 입력 */}
                    <div className="mt-6 space-y-2">
                      <label className="block text-[13px] font-medium tracking-[0.08em] text-[#121212]">
                        PASSWORD
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="h-[2.5rem] w-full border border-[#d2d2d7] bg-white px-4 text-[14px] outline-none transition focus:border-black"
                        placeholder=""
                      />
                    </div>
                  </>
                )}

                {authMode === 'signup' && (
                  <>
                    {/* 이름 */}
                    <div className="mt-10 space-y-2">
                      <label className="block text-[13px] font-medium tracking-[0.08em] text-[#121212]">
                        NAME
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="h-[2.5rem] w-full border border-[#d2d2d7] bg-white px-4 text-[14px] outline-none transition focus:border-black"
                        placeholder=""
                      />
                    </div>

                    {/* 아이디 */}
                    <div className="mt-6 space-y-2">
                      <label className="block text-[13px] font-medium tracking-[0.08em] text-[#121212]">
                        ID
                      </label>
                      <input
                        type="text"
                        autoComplete="off"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="h-[2.5rem] w-full border border-[#d2d2d7] bg-white px-4 text-[14px] outline-none transition focus:border-black"
                        placeholder=""
                      />
                    </div>

                    {/* 비밀번호 */}
                    <div className="mt-6 space-y-2">
                      <label className="block text-[13px] font-medium tracking-[0.08em] text-[#121212]">
                        PASSWORD
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="h-[2.5rem] w-full border border-[#d2d2d7] bg-white px-4 text-[14px] outline-none transition focus:border-black"
                        placeholder=""
                      />
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="mt-6 space-y-2">
                      <label className="block text-[13px] font-medium tracking-[0.08em] text-[#121212]">
                        CONFIRM PASSWORD
                      </label>
                      <input
                        type="password"
                        autoComplete="new-password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="h-[2.5rem] w-full border border-[#d2d2d7] bg-white px-4 text-[14px] outline-none transition focus:border-black"
                        placeholder=""
                      />
                    </div>
                  </>
                )}

                {/* Primary 버튼 */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-8 mb-8 flex h-[2.5rem] w-full items-center justify-center bg-black text-[14px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-black/85 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '처리 중...' : (authMode === 'login' ? 'LOGIN' : 'JOIN')}
                </button>

                {/* Divider */}
                <div className="mt-10 flex items-center gap-4 text-[12px] text-[#d2d2d7]">
                  <div className="h-px flex-1 bg-[#d2d2d7]" />
                  <span>or</span>
                  <div className="h-px flex-1 bg-[#d2d2d7]" />
                </div>

                {/* Google 로그인 / 회원가입 */}
                <p className="mt-6 text-[14px] font-medium text-[#121212]">
                  {authMode === 'login'
                    ? 'Instantly login via Google'
                    : 'Instantly sign up via Google'}
                </p>
                <button
                  type="button"
                  className="mt-3 flex h-[2.5rem] w-full items-center justify-center gap-3 border border-[#121212] text-[14px] font-medium uppercase tracking-[0.12em] text-[#121212] transition hover:bg-black hover:text-white"
                >
                  <span className="text-[18px]">G</span>
                  <span>{authMode === 'login' ? 'Login with Google' : 'Sign up with Google'}</span>
                </button>

              </div>
            </form>

            {/* 토스트 팝업 */}
            <div 
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white text-black text-[14px] font-medium shadow-lg transition-all duration-300 ease-out ${
                showToast ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
              }`}
            >
              {toastMessage}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

