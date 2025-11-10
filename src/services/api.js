// API Service - Centralized API calls for the application

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://visa.itfuturz.in'

/**
 * Upload passport and PAN card documents for data extraction
 * @param {File[]} passportFiles - Array of passport image files (max 2)
 * @param {File} panFile - PAN card image file
 * @returns {Promise<Object>} Response containing extracted data and URLs
 */
export const uploadDocuments = async (passportFiles, panFile) => {
  try {
    // Prepare FormData for upload API
    const uploadFormData = new FormData()
    
    // Append all passport files (can be multiple)
    passportFiles.forEach((file) => {
      uploadFormData.append('passport', file)
    })
    uploadFormData.append('pancard', panFile)

    console.log('Calling upload API with files:', {
      passport: passportFiles.map(f => f.name),
      pancard: panFile.name
    })

    const response = await fetch(`${BASE_URL}/api/v1/upload`, {
      method: 'POST',
      body: uploadFormData
    })

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        console.error('Upload API Error Response:', errorData)
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || JSON.stringify(err)).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else {
          errorMessage = JSON.stringify(errorData)
        }
      } catch (e) {
        const text = await response.text()
        console.error('Error response text:', text)
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Upload API Response:', result)
    
    return result
  } catch (error) {
    console.error('Error in uploadDocuments:', error)
    throw error
  }
}

/**
 * Store application data after user review
 * @param {Object} formData - Form data with all user inputs
 * @param {Object} uploadResponse - Response from upload API containing URLs and raw data
 * @returns {Promise<Object>} Response from store API
 */
export const storeApplication = async (formData, uploadResponse) => {
  try {
    if (!uploadResponse) {
      throw new Error('Upload response not found. Please upload documents again.')
    }

    // Format dates to DD/MM/YYYY format
    const formatDate = (dateString) => {
      if (!dateString) return null
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }

    // Get URLs from upload response
    let passportUrls = []
    let panUrl = ''
    
    // Extract passport URLs
    if (uploadResponse.passport_urls) {
      passportUrls = Array.isArray(uploadResponse.passport_urls) 
        ? uploadResponse.passport_urls 
        : [uploadResponse.passport_urls]
    }
    
    // Extract PAN URL
    if (uploadResponse.pan_url) {
      panUrl = uploadResponse.pan_url
    }

    // Validate URLs are present
    if (passportUrls.length === 0 || !panUrl) {
      console.error('URLs not found in response:', uploadResponse)
      throw new Error('Failed to get document URLs from upload response')
    }

    // Prepare extracted data structure matching API format with updated form values
    const extractedData = {
      passport: {
        passport_number: formData.passportNumber || null,
        name: formData.fullName || null,
        nationality: formData.nationality || null,
        dob: formatDate(formData.dateOfBirth),
        date_of_issue: formatDate(formData.passportIssueDate),
        date_of_expiry: formatDate(formData.passportExpiryDate),
        place_of_birth: formData.placeOfBirth || null,
        place_of_issue: formData.passportIssuePlace || null,
        sex: formData.gender ? formData.gender.charAt(0).toUpperCase() : null,
        father_name: formData.passportFatherName || null,
        mother_name: formData.passportMotherName || null,
        spouse_name: formData.spouseName || null,
        address: formData.address || null,
        pin_code: formData.passportPinCode || null,
        state: null,
        old_passport_number: formData.oldPassportNumber || null,
        old_passport_issue_date: formData.oldPassportIssueDate ? formatDate(formData.oldPassportIssueDate) : null,
        old_passport_issue_place: formData.oldPassportIssuePlace || null,
        file_number: formData.fileNumber || null,
        raw_text: uploadResponse.extracted_data?.passport?.raw_text || ''
      },
      pan: {
        pan_number: formData.panNumber || null,
        name: formData.panName || null,
        father_name: formData.panFatherName || null,
        dob: formData.panDob ? formatDate(formData.panDob) : (uploadResponse.extracted_data?.pan?.dob || null),
        raw_text: uploadResponse.extracted_data?.pan?.raw_text || ''
      }
    }

    // Store data using /api/v1/store
    const storeFormData = new FormData()
    
    // passport_urls should be a JSON array string
    storeFormData.append('passport_urls', JSON.stringify(passportUrls))
    
    // pan_url is a single URL string
    storeFormData.append('pan_url', panUrl)
    
    // extracted_data as JSON string
    storeFormData.append('extracted_data', JSON.stringify(extractedData))
    
    // Add email and mobileNo
    storeFormData.append('email', formData.email || '')
    storeFormData.append('mobileNo', formData.phoneNumber || '')

    console.log('Storing data:', {
      passport_urls: passportUrls,
      pan_url: panUrl,
      extracted_data: extractedData,
      email: formData.email,
      mobileNo: formData.phoneNumber
    })

    const response = await fetch(`${BASE_URL}/api/v1/store`, {
      method: 'POST',
      body: storeFormData
    })

    if (!response.ok && response.status !== 200) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        console.error('Store API Error Response:', errorData)
        // Handle different error response formats
        if (errorData.detail) {
          // FastAPI style errors
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => err.msg || JSON.stringify(err)).join(', ')
          } else {
            errorMessage = errorData.detail
          }
        } else if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else {
          errorMessage = JSON.stringify(errorData)
        }
      } catch (e) {
        const text = await response.text()
        console.error('Error response text:', text)
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    console.log('Store result:', result)
    
    return result
  } catch (error) {
    console.error('Error in storeApplication:', error)
    throw error
  }
}

/**
 * Get paginated list of documents with optional search
 * @param {number} page - Page number (starts from 1)
 * @param {number} pageSize - Number of items per page
 * @param {string} search - Search query string
 * @returns {Promise<Object>} Response containing documents list and pagination info
 */
export const getDocuments = async (page = 1, pageSize = 10, search = '') => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    })
    
    // Add search parameter if provided
    if (search && search.trim()) {
      params.append('search', search.trim())
    }
    
    const response = await fetch(`${BASE_URL}/api/v1/documents?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error in getDocuments:', error)
    throw error
  }
}

/**
 * Get document details by ID
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document details
 */
export const getDocumentById = async (documentId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/documents/${documentId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch document details')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error in getDocumentById:', error)
    throw error
  }
}

/**
 * Delete a document by ID
 * @param {string} documentId - Document ID to delete
 * @returns {Promise<Object>} Response containing success message and deleted ID
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/documents/${documentId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        const text = await response.text()
        errorMessage = text || errorMessage
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error in deleteDocument:', error)
    throw error
  }
}

