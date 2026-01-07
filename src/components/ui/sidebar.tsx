import React from 'react';

type SidebarProps = React.HTMLAttributes<HTMLElement> & {
  variant?: 'sidebar' | 'floating' | 'inset';
  side?: 'left' | 'right';
  collapsible?: 'offcanvas' | 'icon' | 'none';
};

export const Sidebar: React.FC<SidebarProps> = ({ children, variant = 'sidebar', side = 'left', className = '', ...props }) => {
  const base = 'flex flex-col text-sidebar-foreground';
  const variantClass =
    variant === 'floating'
      ? 'fixed left-4 top-4 h-[calc(100vh-32px)] w-80 rounded-xl shadow-lg bg-white dark:bg-gray-800 z-40 overflow-hidden'
      : variant === 'inset'
      ? 'relative'
      : 'w-64';

  const sideClass = side === 'right' ? 'right-0' : 'left-0';

  return (
    <nav className={`${base} ${variantClass} ${sideClass} ${className}`} {...props}>
      {children}
    </nav>
  );
};

export const SidebarHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex-shrink-0 px-4 py-3 border-b ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`flex-1 overflow-y-auto p-2 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarGroup: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <section className={`mb-2 ${className}`} {...props}>
    {children}
  </section>
);

export const SidebarGroupLabel: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`} {...props}>
    {children}
  </h3>
);

export const SidebarGroupContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`px-1 ${className}`} {...props}>
    {children}
  </div>
);

export const SidebarMenu: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({ children, className = '', ...props }) => (
  <ul className={`space-y-1 ${className}`} {...props}>
    {children}
  </ul>
);

export const SidebarMenuItem: React.FC<React.LiHTMLAttributes<HTMLLIElement>> = ({ children, className = '', ...props }) => (
  <li className={`rounded-md ${className}`} {...props}>
    {children}
  </li>
);

type SidebarMenuButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { isActive?: boolean };
export const SidebarMenuButton: React.FC<SidebarMenuButtonProps> = ({ children, isActive, className = '', ...props }) => (
  <button
    {...props}
    className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 ${isActive ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'} ${className}`}
  >
    {children}
  </button>
);

export const SidebarRail: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div className={`p-2 border-t ${className}`} {...props} />
);

export default Sidebar;

