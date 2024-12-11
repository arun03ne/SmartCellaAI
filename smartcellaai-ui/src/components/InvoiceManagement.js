import React, { useState } from 'react';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import './InvoiceManagement.css';
import invoicesData from '../data.json';

const InvoiceManagement = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [invoices, setInvoices] = useState(invoicesData.invoices);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      alert('Please upload a valid PDF, JPG, or PNG file.');
      return;
    }

    const filePreview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
    setUploadedFiles((prev) => [
      ...prev,
      { name: file.name, size: (file.size / 1024).toFixed(2) + ' KB', type: file.type, preview: filePreview },
    ]);
    alert('File uploaded successfully!');
  };

  return (
    <Box className="invoice-management">
      <Typography variant="h5" gutterBottom>
        Invoice History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice ID</TableCell>
              <TableCell>Invoice Title</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice, index) => (
              <TableRow key={index}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.title}</TableCell>
                <TableCell>{invoice.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box className="upload-section">
        <Button variant="contained" component="label">
          Upload Invoice
          <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
        </Button>
        {uploadedFiles.length > 0 && (
          <Box className="uploaded-files">
            <Box className="file-preview-section">
              {uploadedFiles.map((file, index) => (
                <Box key={index} className="file-preview">
                  {file.preview && <img src={file.preview} alt={file.name} className="uploaded-image" />}
                  <Typography className="file-info">
                    {file.name} ({file.size})
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default InvoiceManagement;