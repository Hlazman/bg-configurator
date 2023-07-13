import logo from '../logo.svg';
import React, { useRef } from 'react';
import { Button } from 'antd';
import html2pdf from 'html2pdf.js';

export const OrderPage = () => {
  const orderFileNameRef = useRef(null);

  const handlePdfExport = () => {
    const element = document.getElementById('pdf-content');
    const orderFileName = orderFileNameRef.current.innerText;

    html2pdf()
      .from(element)
      .set({
        filename: `${orderFileName}.pdf`,
      })
      .save();
  };

  const handleOpenPdf = () => {
    const element = document.getElementById('pdf-content');
    const orderFileName = orderFileNameRef.current.innerText;

    html2pdf()
      .from(element)
      .set({
        filename: `${orderFileName}.pdf`,
      })
      .outputPdf('dataurlnewwindow');
  };

  return (
    <>
      <h1>Order page</h1>
      {/* Дополнительные элементы страницы */}
      <p ref={orderFileNameRef} id="orderFileName">Order № 10230</p>

      <div id="pdf-content">
        {/* Контент, который будет экспортирован в PDF */}
        <img src={logo} alt="Logo" />
        <p>some paragraph</p>
        <p>some paragraph</p>
        <p>some paragraph</p>
        <p>some paragraph</p>
        <p>some paragraph</p>
        <p>some paragraph</p>
        <p>some paragraph</p>
      </div>

      <Button onClick={handlePdfExport}>Сохранить в PDF</Button>
      <Button onClick={handleOpenPdf}>Открыть PDF</Button>
    </>
  );
};
