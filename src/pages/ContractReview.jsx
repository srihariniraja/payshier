import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function ContractReview({ goTo, formData }) {
  console.log('Form Data received:', formData);
  
  const [lenderSigned, setLenderSigned] = useState(false);
  const [borrowerSigned, setBorrowerSigned] = useState(false);
  const [lenderSignature, setLenderSignature] = useState(null);
  const [borrowerSignature, setBorrowerSignature] = useState(null);
  const contractRef = useRef();

  // Process the form data with the actual values
  const processedContractData = formData ? {
    lenderName: formData.loanType === 'lending' ? formData.personName : formData.otherPartyName,
    borrowerName: formData.loanType === 'lending' ? formData.otherPartyName : formData.personName,
    amount: `₹${formData.amount}`,
    purpose: formData.purpose,
    agreementDate: formData.dueDate,
    dueDate: formData.dueDate,
    returnDate: formData.returnDate,
    contractId: "CNTR" + Date.now()
  } : {
    lenderName: "Not provided",
    borrowerName: "Not provided", 
    amount: "Not provided",
    purpose: "Not provided",
    agreementDate: new Date().toLocaleDateString(),
    dueDate: "Not provided",
    returnDate: "Not provided",
    contractId: "CNTR" + Date.now()
  };

  // Signature Canvas Components
  const LenderSignaturePad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearSignature = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setLenderSignature(null);
    };

    const saveSignature = () => {
      const canvas = canvasRef.current;
      const signature = canvas.toDataURL();
      setLenderSignature(signature);
    };

    return (
      <div data-signature-pad style={{ textAlign: 'center' }}>
        <p style={{ color: '#333', marginBottom: '10px', fontWeight: 'bold' }}>Draw Your Signature</p>
        <canvas
          ref={canvasRef}
          width={250}
          height={100}
          style={{ 
            border: '1px solid #ccc', 
            background: 'white',
            borderRadius: '5px',
            cursor: 'crosshair'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={clearSignature}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Clear
          </button>
          <button
            onClick={saveSignature}
            style={{
              background: '#51cf66',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Save Signature
          </button>
        </div>
      </div>
    );
  };

  const BorrowerSignaturePad = () => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      setIsDrawing(true);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearSignature = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setBorrowerSignature(null);
    };

    const saveSignature = () => {
      const canvas = canvasRef.current;
      const signature = canvas.toDataURL();
      setBorrowerSignature(signature);
    };

    return (
      <div data-signature-pad style={{ textAlign: 'center' }}>
        <p style={{ color: '#333', marginBottom: '10px', fontWeight: 'bold' }}>Draw Your Signature</p>
        <canvas
          ref={canvasRef}
          width={250}
          height={100}
          style={{ 
            border: '1px solid #ccc', 
            background: 'white',
            borderRadius: '5px',
            cursor: 'crosshair'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={clearSignature}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Clear
          </button>
          <button
            onClick={saveSignature}
            style={{
              background: '#51cf66',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Save Signature
          </button>
        </div>
      </div>
    );
  };

  // UPDATED PDF GENERATION FUNCTION - HIDES SIGNATURE PADS AND BUTTONS
  const generatePDF = async () => {
    // Hide signature drawing pads (including buttons) before capturing
    const signaturePads = document.querySelectorAll('[data-signature-pad]');
    const originalDisplay = [];
    
    signaturePads.forEach((pad, index) => {
      originalDisplay[index] = pad.style.display;
      pad.style.display = 'none';
    });

    const element = contractRef.current;
    
    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('loan-agreement-contract.pdf');

    // Restore the signature pads
    signaturePads.forEach((pad, index) => {
      pad.style.display = originalDisplay[index];
    });
  };

  const canGeneratePDF = lenderSigned && borrowerSigned && lenderSignature && borrowerSignature;

  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
       {/* ✅ ADD BACK BUTTON HERE */}
    <button 
      onClick={() => goTo('features')}
      style={{
        background: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '25px',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginBottom: '20px'
      }}
    >
      ← Back to Features
    </button>
      <div ref={contractRef} style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
          Loan Agreement Contract
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>Contract Details</h3>
          <p><strong>Contract ID:</strong> {processedContractData.contractId}</p>
          <p><strong>Agreement Date:</strong> {processedContractData.agreementDate}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Parties</h3>
          <p><strong>Lender:</strong> {processedContractData.lenderName}</p>
          <p><strong>Borrower:</strong> {processedContractData.borrowerName}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>Loan Terms</h3>
          <p><strong>Loan Amount:</strong> {processedContractData.amount}</p>
          <p><strong>Purpose:</strong> {processedContractData.purpose}</p>
          <p><strong>Due Date:</strong> {processedContractData.dueDate}</p>
          <p><strong>Return Date:</strong> {processedContractData.returnDate}</p>
        </div>

        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <h4>Lender Signature</h4>
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="checkbox" 
                checked={lenderSigned}
                onChange={(e) => setLenderSigned(e.target.checked)}
              />
              <label style={{ marginLeft: '8px' }}>I agree to the terms</label>
            </div>
            <LenderSignaturePad />
            {lenderSignature && (
              <div style={{ marginTop: '10px' }}>
                <img src={lenderSignature} alt="Lender Signature" style={{ width: '150px', border: '1px solid #ccc' }} />
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h4>Borrower Signature</h4>
            <div style={{ marginBottom: '10px' }}>
              <input 
                type="checkbox" 
                checked={borrowerSigned}
                onChange={(e) => setBorrowerSigned(e.target.checked)}
              />
              <label style={{ marginLeft: '8px' }}>I agree to the terms</label>
            </div>
            <BorrowerSignaturePad />
            {borrowerSignature && (
              <div style={{ marginTop: '10px' }}>
                <img src={borrowerSignature} alt="Borrower Signature" style={{ width: '150px', border: '1px solid #ccc' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        {canGeneratePDF ? (
          <button
            onClick={generatePDF}
            style={{
              background: '#339af0',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            Generate PDF Contract
          </button>
        ) : (
          <p style={{ color: '#868e96' }}>
            Both parties must agree to terms and provide signatures to generate PDF
          </p>
        )}
      </div>
    </div>
  );
}

export default ContractReview;