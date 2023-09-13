import React, { useState } from 'react';
import { Tabs } from 'antd';
import CanvasStep from './CanvasStep';
import StartDataStep from './StartDataStep';

const GroupDoorStep = ({ formData, handleCardClick, handleNext }) => {
  const [activeTab, setActiveTab] = useState('startdata');

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };

  return (
    <Tabs 
      type="card" 
      activeKey={activeTab} 
      onChange={handleTabChange} 
      items={[
        {
          label: 'Start Data',
          key: 'startdata',
          children: <StartDataStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        },
        {
          label: 'Canvas',
          key: 'canvas',
          children: <CanvasStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        },
      ]}
    />
  );
};

export default GroupDoorStep;
