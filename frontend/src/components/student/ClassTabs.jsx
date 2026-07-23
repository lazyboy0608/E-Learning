import React from 'react';

const ClassTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="class-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`class-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ClassTabs;
