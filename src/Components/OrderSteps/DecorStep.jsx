import React, { useState } from 'react';
import { Tabs } from 'antd';
import VeneerStep from './VeneerStep';
import PaintStep from './PaintStep';

const { TabPane } = Tabs;

const DecorStep = ({ formData, handleCardClick, handleNext }) => {
  const [activeTab, setActiveTab] = useState('veneer');

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };

  return (
    <Tabs activeKey={activeTab} onChange={handleTabChange}>
      <TabPane tab="Veneer" key="veneer">
        <VeneerStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />
      </TabPane>
      <TabPane tab="Paint" key="paint">
        <PaintStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />
      </TabPane>
    </Tabs>
  );
};

export default DecorStep;
