import React, { useState } from 'react';
import { Tabs } from 'antd';
import VeneerStep from './VeneerStep';
import PaintStep from './PaintStep';
import StoneStep from './StoneStep';
import MirrorStep from './MirrorStep';

const GroupDecorStep = ({ formData, handleCardClick, handleNext }) => {
  const [activeTab, setActiveTab] = useState('veneer');

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
          label: 'Veneer',
          key: 'veneer',
          children: <VeneerStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        },
        {
          label: 'Paint',
          key: 'paint',
          children: <PaintStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        },
        {
          label: 'Stoneware',
          key: 'stoneware',
          children: <StoneStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        },
        {
          label: 'Mirror',
          key: 'mirror',
          children: <MirrorStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        },
      ]}
    />
  );
};

export default GroupDecorStep;
