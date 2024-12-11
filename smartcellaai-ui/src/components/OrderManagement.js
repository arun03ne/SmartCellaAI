import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Pagination from '@mui/material/Pagination';
import { uploadOrderInput } from '../services/ApiProvider'; 

import './OrderManagement.css';

const steps = ['Upload Order', 'Agents Processing'];

const orderHistoryData = [];

const OrderManagement = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStep, setShowStep] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetailsVisible, setOrderDetailsVisible] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [orderRequirement, setOrderRequirement] = useState('');
  const [inputType, setInputType] = useState('text');
  const [isUploadButtonDisabled, setIsUploadButtonDisabled] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [eventSuccess, setEventSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [chatHistory, setChatHistory] = useState(null);
  const entriesPerPage = 4;

  const resetToInitialState = () => {
    setShowStep(false);
    setUploadedFile(null);
    setFilePreview(null);
    setOrderRequirement('');
    setCurrentStep(0);
    setOrderDetailsVisible(false);
    setIsProcessing(false);
    setIsUploadButtonDisabled(false);
    setHasChanges(false); 
    setChatHistory(null)
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      const filePreview = URL.createObjectURL(file);
      setUploadedFile(file);
      setFilePreview(filePreview);
      setHasChanges(true); 
    } else {
      alert('Please upload a valid PDF, JPG, or PNG file.');
    }
  };

  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      const filePreview = URL.createObjectURL(file);
      setUploadedFile(file);
      setFilePreview(filePreview);
      setHasChanges(true); 
    } else {
      alert('Please upload a valid PDF, JPG, or PNG file.');
    }
    setDragging(false);
  };

  const handleInputChange = (event) => {
    setOrderRequirement(event.target.value);
    setHasChanges(true); // Track change
  };

  const processSteps = async () => {
    setShowStep(true);
    setIsUploadButtonDisabled(true);
    setIsProcessing(true);
    setCurrentStep(1);
    const inputData = inputType === 'file' ? uploadedFile : orderRequirement;
    const isFile = inputType === 'file';

    try {
      const response = await uploadOrderInput(inputData, isFile);
      setChatHistory(JSON.stringify(response));
      const filtered_response = getLastContentValue(response);
      setCurrentStep(2);
      setEventSuccess(true);
      setIsProcessing(false);
      setOrderDetailsVisible(true);
      setOrderDetails(filtered_response);
    } catch (error) {
      setEventSuccess(false);
      setIsProcessing(false);
      alert('Failed to upload order input. Please try again.');
      console.error('API call failed:', error);
    }
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const displayedOrders = orderHistoryData.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const extractWarehouseData = (content) => {
    const extractedData = [];
          
        // Extract the device ID using regex
        const itemIdMatch = content.match(/SKU:\s*([\w\s-]+)/);
        const itemId = itemIdMatch ? itemIdMatch[1] : null;
        
        // Extract warehouse ID and shipping cost pairs using regex
        const warehouseMatches = content.matchAll(/Warehouse ID:\s*(\w+),\s*Total Shipping Cost:\s*([\d\.]+)/g);

        for (const match of warehouseMatches) {
          const warehouseId = match[1];
          const totalShippingCost = parseFloat(match[2]);

          extractedData.push({
            itemId,
            warehouseId,
            totalShippingCost
          });
        }
        
    return  extractedData;
  };

const getLastContentValue = (chatData) => {
    if (!Array.isArray(chatData)) {
        console.error('Input must be an array of chat data.');
        return null;
    }

    let lastContent = null;

    chatData.forEach(chat => {
        if (Array.isArray(chat.chat_history) && chat.chat_history.length > 0) {
            // Get the last content from the chat_history of this particular chat
            const lastMessage = chat.chat_history[1];
            if (lastMessage && lastMessage.content) {
                lastContent = lastMessage.content;
            }
        }
    });
    return extractWarehouseData(lastContent);
};
  
  return (
    <Box className="order-management">
      <Typography variant="h5" className="left-aligned-title">
        Process Order
      </Typography>

      <ToggleButtonGroup
        value={inputType}
        exclusive
        onChange={(e, newInputType) => newInputType && setInputType(newInputType)}
        aria-label="input type selection"
        className="input-toggle-group"
      >
        <ToggleButton value="text">Text</ToggleButton>
        <ToggleButton value="file">File</ToggleButton>
      </ToggleButtonGroup>

      {inputType === 'text' && (
        <Box className="text-requirement-container">
          <TextField
            value={orderRequirement}
            onChange={handleInputChange}
            label="Order Requirement"
            variant="outlined"
            fullWidth
          />
          <Button onClick={resetToInitialState}>Cancel</Button>
        </Box>
      )}

      {inputType === 'file' && (
        <Box
          className={`upload-container ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleFileDrop}
        >
          {!filePreview ? (
            <>
              <Typography>Drag & Drop your file here</Typography>
              <Button variant="outlined" component="label">
                Browse File
                <input type="file" hidden onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png" />
              </Button>
            </>
          ) : (
            <Box className="file-preview">
              <img src={filePreview} alt="Uploaded Preview" className="file-preview-content" />
              <CloseIcon className="close-icon" onClick={resetToInitialState} />
            </Box>
          )}
        </Box>
      )}

      {hasChanges && (
        <Button
          variant="contained"
          onClick={processSteps}
          className="upload-button"
          disabled={isUploadButtonDisabled}
        >
          Upload Order
        </Button>
      )}

      <Box className="steps-container">
        {showStep && steps.map((step, index) => (
          <Box key={index} className="step-wrapper">
            <Box className="step">
              {index < currentStep 
                ? (!eventSuccess && currentStep > 2 
                  ? <ErrorIcon className="error" /> 
                  : <CheckCircleIcon className="completed" />
                ) 
                : <CircularProgress />
              }
              <Typography className="step-title">{step}</Typography>
            </Box>
            {index < steps.length - 1 && (
              <ArrowForwardIcon className="step-arrow" />
            )}
          </Box>
        ))}
      </Box>

      {orderDetailsVisible && (
        <Box className="order-details-container">
          <Typography variant="h6" className="left-aligned-title">
            Optimal Warehouse List
          </Typography>
          <TableContainer component={Paper} className="order-details">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item ID</TableCell>
                  <TableCell>Warehouse ID</TableCell>
                  <TableCell>Total Shipping Cost</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {orderDetails.map((row, index) => (
    <TableRow key={index}>
      <TableCell>{row.itemId}</TableCell>
      <TableCell>{row.warehouseId}</TableCell>
      <TableCell>{row.totalShippingCost}</TableCell>
    </TableRow>
  ))}
</TableBody>
            </Table>
          </TableContainer>
          <Box className="action-buttons">
            <Button
              variant="contained"
              color="success"
              onClick={resetToInitialState}
            >
              Create Purchase Order
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={resetToInitialState}
            >
              Reject
            </Button>
          </Box>
        </Box>
      )}

{chatHistory != null && (
  <div>
  <Typography variant="h6" className="left-aligned-title">
  Chat History
</Typography>
<div className="console-log">{chatHistory}</div>
</div>)}

      {orderHistoryData.length > 0 && (<Box className="order-history-container">
  <Typography variant="h6" className="left-aligned-title">
    Order History
  </Typography>
  <TableContainer component={Paper} className="order-history">
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Order ID</TableCell>
          <TableCell>Order Title</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {displayedOrders.map((order, index) => (
          <TableRow key={index}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.title}</TableCell>
            <TableCell>{order.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <Box className="pagination-container">
    <Pagination
      count={Math.ceil(orderHistoryData.length / entriesPerPage)}
      page={currentPage}
      onChange={handlePageChange}
      color="primary"
    />
  </Box>
</Box>
)}
    </Box>
  );
};

export default OrderManagement;
