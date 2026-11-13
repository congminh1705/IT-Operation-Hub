import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const roles = { manager: 'IT Manager', requester: 'Requester', technician: 'Technician', admin: 'Admin' };

function DashboardReview() {
  const params = new URLSearchParams(location.search);
  const [role, setRole] = useState(Object.hasOwn(roles, params.get('role')) ? params.get('role') : 'manager');
  const file = role === 'manager' ? 'index' : role;
  const observer = useRef(null);
  useEffect(() => () => observer.current?.disconnect(), []);
  function fitDashboard(event) {
    observer.current?.disconnect();
    const frame = event.currentTarget, doc = frame.contentDocument;
    const main = doc.querySelector('#main');
    if (!main) return;
    const fit = () => {
      const height = main.getBoundingClientRect().height + (doc.querySelector('.topbar')?.offsetHeight || 0) + (doc.querySelector('.app-footer')?.offsetHeight || 0) + 24;
      frame.style.height = `${Math.ceil(height)}px`;
    };
    observer.current = new ResizeObserver(fit); observer.current.observe(main); fit();
  }
  return <div className="min-h-screen bg-[#f5f7f6]">
    <header className="review-header font-ui flex flex-wrap items-center justify-between gap-2 border-b border-[#d8e3dc] bg-[#edf3ef] px-4 text-[11px] text-[#526d5e]">
      <span className="flex items-center gap-2"><i className="h-1.5 w-1.5 rounded-full bg-[#087f78]"/>Thiết kế v1.2 · 12.11.2026</span>
      <nav className="flex flex-wrap items-center gap-1" aria-label="Vai trò xem trước">
        {Object.entries(roles).map(([key, name]) => <button key={key} aria-pressed={role === key} onClick={() => { setRole(key); history.replaceState(null, '', `?role=${key}`); }} className={`min-h-10 px-3 font-medium ${role === key ? 'border-b-2 border-[#087f78] bg-[#d8eee4] text-[#1c6b53]' : 'border-b-2 border-transparent hover:bg-[#e6f0e9]'}`}>{name}</button>)}
      </nav>
      <a href={`../../${file}.html`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center text-[#087f78] hover:underline">Mở riêng dashboard ↗</a>
    </header>
    <main><iframe key={role} onLoad={fitDashboard} title={`Dashboard ${roles[role]} — phong cách tím, điều phối Night City`} src={`../../${file}.html?violet=1&embedded=1${['manager', 'admin'].includes(role) ? '&dispatch=night' : ''}`} className="dashboard-view w-full border-0"/></main>
  </div>;
}

createRoot(document.getElementById('root')).render(<DashboardReview/>);
