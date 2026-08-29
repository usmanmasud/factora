import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return <div className={`toast${type === 'error' ? ' error' : ''}`}>{message}</div>;
}
