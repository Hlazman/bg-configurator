import React, { useState } from 'react';
import { Tabs } from 'antd';
import HingesStep from './HingesStep';
import KnobeStep from './KnobeStep';
import SkirtingStep from './SkirtingStep';
import LockStep from './LockStep';

const { TabPane } = Tabs;

const OptionsStep = ({ formData, handleCardClick, handleNext }) => {
  const [activeTab, setActiveTab] = useState('hinges');

  const handleTabChange = tabKey => {
    setActiveTab(tabKey);
  };

  return (
    <Tabs activeKey={activeTab} onChange={handleTabChange}>
      <TabPane tab="Hinges" key="hinges">
        <HingesStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />
      </TabPane>

      <TabPane tab="Knobe" key="knobe">
        <KnobeStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />
      </TabPane>

      <TabPane tab="Skirting" key="skirting">
        <SkirtingStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />
      </TabPane>

      <TabPane tab="Lock" key="lock">
        <LockStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />
      </TabPane>
    </Tabs>
  );
};

export default OptionsStep;
