
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { useStorage } from '../contexts/StorageContext';

export default function GlobalLoadingIndicator() {
  const { globalLoading } = useStorage();

  if (!globalLoading.active) return null;

  return (
    <div className="global-loading-container">
      <div className="loading-progress-bar">
        <div className="progress-shimmer"></div>
      </div>
      {globalLoading.message && (
        <div className="loading-status-badge">
          <div className="status-dot"></div>
          <span>{globalLoading.message}</span>
        </div>
      )}
    </div>
  );
}
