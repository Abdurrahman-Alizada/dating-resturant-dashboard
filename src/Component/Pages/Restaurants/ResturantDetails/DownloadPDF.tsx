import React from "react";
import { useLocation } from 'react-router-dom'


const DownloadPDFButton: React.FC = ({}) => {
  const location = useLocation()
  const {menuURL} = location.state
const fileName =""
  const handleDownload = async () => {
        try {
          const response = await fetch(menuURL);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          // Release the object URL
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading the PDF:', error);
          // Handle error as needed
        }
      };
  return (
    <div className="cursor-pointer max-h-48 w-60" onClick={handleDownload}>
      <img className="object-cover h-full mt-5" src="/pdf.png" alt="docs" />
    </div>
  );
};

export default DownloadPDFButton;
