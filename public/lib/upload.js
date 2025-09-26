/**
 * Upload file function for CKEditor
 * @param {string} accessToken - Access token for authentication
 * @param {FormData} formData - Form data containing the file to upload
 * @returns {Promise} Promise that resolves with upload result
 */
const uploadFile = async (accessToken, formData) => {
  try {
    const response = await fetch('/api/v1/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    // Return the expected format for CKEditor
    return {
      url: result.data?.url || result.url,
      thumbnail: result.data?.thumbnail || result.thumbnail || result.data?.url || result.url,
      id: result.data?.id || result.id
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default uploadFile;