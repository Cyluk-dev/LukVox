import React from 'react';

const ShapesMenu: React.FC = () => {
  return (
    <div className="shapes-menu">
      <div className="shapes-grid single-item">
        <button className="shape-btn" title="Rectángulo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ShapesMenu;
