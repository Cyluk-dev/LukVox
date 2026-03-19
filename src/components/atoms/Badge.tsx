import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  empty?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ children, empty }) => {
  return (
    <span className={`badge ${empty ? 'empty' : ''}`}>
      {children}
    </span>
  );
};

export default Badge;
