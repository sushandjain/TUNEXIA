import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/frontend-assets/assets';

const BottomNav = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const navItems = [
        { label: 'Home', path: '/', icon: assets.home_icon },
        { label: 'Library', path: '/library', icon: assets.stack_icon },
        { label: 'Admin', path: '/admin', icon: assets.plus_icon }
    ];

    return (
        <nav 
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-md border-t border-neutral-800 lg:hidden h-14 flex items-center justify-around px-2"
            aria-label="Mobile Navigation"
        >
            {navItems.map((item) => {
                const isActive = item.path === '/' 
                    ? currentPath === '/' || currentPath.startsWith('/album')
                    : currentPath.startsWith(item.path);

                return (
                    <button
                        key={item.label}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center flex-1 h-full min-w-[44px] min-h-[44px] transition-colors ${
                            isActive ? 'text-green-500 font-semibold' : 'text-neutral-400 hover:text-white'
                        }`}
                        aria-label={`Navigate to ${item.label}`}
                    >
                        <img 
                            src={item.icon} 
                            alt="" 
                            className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-110 filter brightness-125' : 'opacity-70'}`}
                        />
                        <span className="text-[10px] tracking-tight">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default React.memo(BottomNav);
