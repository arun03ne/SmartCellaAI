import axios from 'axios';

// Use environment variable for flexibility (fall back to the default URL if not set)
const API_BASE_URL = "http://13.89.106.239:80";

export const uploadOrderInput = async (data, isFile) => {
  try {
    // Corrected the URL to avoid invalid encoding
    const endpoint = `${API_BASE_URL}/processInput`;
    const formData = new FormData();

    // Dynamically append form data based on the `isFile` flag
    if (isFile) {
      formData.append('file', data);
    } else {
      formData.append('chatRequest', data);
    }

    // Log data to ensure correctness (avoid logging large files)
    console.log('Data being sent:', isFile ? 'File Uploaded' : data);

    // Send the POST request
    const response = await axios.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }, // optional, Axios handles it
    });

    return response.data; 

  } catch (error) {
    // Log the error message and server response for easier debugging
    console.error('Error uploading input:', error.message);
    if (error.response) {
      console.error('Server Response:', error.response.data);
    }
    throw error; 
  }
};
