import React, { useState } from 'react';
import { Tabs } from 'antd';
import CanvasStep from './CanvasStep';
import StartDataStep from './StartDataStep';
// import FrameStep from './FrameStep';

// const GroupDoorStep = ({ formData, handleCardClick, handleNext, editOrderId }) => {
const GroupDoorStep = ({ setCurrentStepSend }) => {
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
          // children: <StartDataStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} orderID={editOrderId}/>,
          children: <StartDataStep setCurrentStepSend={setCurrentStepSend}/>,
        },
        {
          label: 'Canvas',
          key: 'canvas',
          // children: <CanvasStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
          children: <CanvasStep setCurrentStepSend={setCurrentStepSend} />,
        },
        // {
        //   label: 'Frame',
        //   key: 'frame',
        //   children: <FrameStep formData={formData} handleCardClick={handleCardClick} handleNext={handleNext} />,
        // },
      ]}
    />
  );
};

export default GroupDoorStep;
