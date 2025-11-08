import { useState } from 'react'
import Swal from 'sweetalert2'

const Home = () => {
  const [passportFiles, setPassportFiles] = useState([]) // Array to support up to 2 passport files
  const [panFile, setPanFile] = useState(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isDataExtracted, setIsDataExtracted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadResponse, setUploadResponse] = useState(null) // Store upload API response
  const [needsRefetch, setNeedsRefetch] = useState(false) // Track if data needs to be re-fetched
  const [validationErrors, setValidationErrors] = useState({
    passportNumber: '',
    panNumber: '',
    phoneNumber: ''
  })

  const [formData, setFormData] = useState({
    passportNumber: '',
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    gender: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    passportIssuePlace: '',
    passportFatherName: '',
    passportMotherName: '',
    passportPinCode: '',
    spouseName: '',
    fileNumber: '',
    oldPassportNumber: '',
    oldPassportIssueDate: '',
    oldPassportIssuePlace: '',
    panNumber: '',
    panName: '',
    panFatherName: '',
    panDob: '',
    email: '',
    phoneNumber: '',
    address: '',
  })

  const handleFileRemove = (type, index = null) => {
    if (type === 'passport') {
      if (index !== null) {
        setPassportFiles(prev => prev.filter((_, i) => i !== index))
      } else {
        setPassportFiles([])
      }
    } else {
      setPanFile(null)
    }
    
    // If already on Review Information step, stay there but mark for re-fetch
    if (isDataExtracted && currentStep >= 2) {
      setIsDataExtracted(false)
      setUploadResponse(null)
      setNeedsRefetch(true)
      setCurrentStep(2) // Keep on step 2
      // Clear form data but keep step
      setFormData({
        passportNumber: '',
        fullName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        nationality: '',
        gender: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        passportIssuePlace: '',
        passportFatherName: '',
        passportMotherName: '',
        passportPinCode: '',
        spouseName: '',
        fileNumber: '',
        oldPassportNumber: '',
        oldPassportIssueDate: '',
        oldPassportIssuePlace: '',
        panNumber: '',
        panName: '',
        panFatherName: '',
        panDob: '',
        email: formData.email, // Keep email and phone
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      })
    } else {
      // If on step 1, reset normally
      setCurrentStep(1)
      setIsDataExtracted(false)
      setUploadResponse(null)
      setNeedsRefetch(false)
    }
  }

  const handleFileUpload = (type, file) => {
    if (type === 'passport') {
      if (passportFiles.length >= 2) {
        Swal.fire({
          icon: 'warning',
          title: 'Maximum files reached',
          text: 'You can upload maximum 2 passport images',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
        return
      }
      setPassportFiles(prev => [...prev, file])
      Swal.fire({
        icon: 'success',
        title: 'Passport uploaded!',
        text: file.name,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      })
    } else {
      setPanFile(file)
      Swal.fire({
        icon: 'success',
        title: 'PAN Card uploaded!',
        text: file.name,
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      })
    }
    
    // If already on Review Information step and files are changed, mark for re-fetch
    if (isDataExtracted && currentStep >= 2) {
      setIsDataExtracted(false)
      setUploadResponse(null)
      setNeedsRefetch(true)
      setCurrentStep(2) // Keep on step 2
      // Clear form data but keep step
      setFormData({
        passportNumber: '',
        fullName: '',
        dateOfBirth: '',
        placeOfBirth: '',
        nationality: '',
        gender: '',
        passportIssueDate: '',
        passportExpiryDate: '',
        passportIssuePlace: '',
        passportFatherName: '',
        passportMotherName: '',
        passportPinCode: '',
        spouseName: '',
        fileNumber: '',
        oldPassportNumber: '',
        oldPassportIssueDate: '',
        oldPassportIssuePlace: '',
        panNumber: '',
        panName: '',
        panFatherName: '',
        panDob: '',
        email: formData.email, // Keep email and phone
        phoneNumber: formData.phoneNumber,
        address: formData.address,
      })
    } else if ((type === 'passport' && panFile) || (type === 'pan' && passportFiles.length > 0)) {
      setCurrentStep(1)
    }
  }

  const handleMultipleFileUpload = (type, files) => {
    if (type === 'passport') {
      const fileArray = Array.from(files)
      const remainingSlots = 2 - passportFiles.length
      
      if (remainingSlots <= 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Maximum files reached',
          text: 'You can upload maximum 2 passport images',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
        return
      }

      // Take only the number of files that fit in remaining slots
      const filesToAdd = fileArray.slice(0, remainingSlots)
      
      if (filesToAdd.length > 0) {
        setPassportFiles(prev => [...prev, ...filesToAdd])
        
        if (filesToAdd.length === 1) {
          Swal.fire({
            icon: 'success',
            title: 'Passport uploaded!',
            text: filesToAdd[0].name,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          })
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Passport images uploaded!',
            text: `${filesToAdd.length} image(s) uploaded`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          })
        }

        // Warn if more files were selected than could be added
        if (fileArray.length > remainingSlots) {
          Swal.fire({
            icon: 'info',
            title: 'Some files not added',
            text: `Only ${remainingSlots} file(s) added. Maximum 2 passport images allowed.`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true
          })
        }
      }
      
      // If already on Review Information step and files are changed, mark for re-fetch
      if (isDataExtracted && currentStep >= 2) {
        setIsDataExtracted(false)
        setUploadResponse(null)
        setNeedsRefetch(true)
        // Clear form data but keep step
        setFormData({
          passportNumber: '',
          fullName: '',
          dateOfBirth: '',
          placeOfBirth: '',
          nationality: '',
          gender: '',
          passportIssueDate: '',
          passportExpiryDate: '',
          passportIssuePlace: '',
          passportFatherName: '',
          passportMotherName: '',
          passportPinCode: '',
          panNumber: '',
          panName: '',
          panFatherName: '',
          panDob: '',
          email: formData.email, // Keep email and phone
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        })
      } else if (panFile || passportFiles.length > 0) {
        setCurrentStep(1)
      }
    }
  }

  // Helper function to convert date string to YYYY-MM-DD format
  const parseDate = (dateString) => {
    if (!dateString) return ''
    // Try different date formats
    if (dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        // DD/MM/YYYY or MM/DD/YYYY
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2]
        return `${year}-${month}-${day}`
      }
    }
    // If already in YYYY-MM-DD format
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }
    return ''
  }

  // Helper function to map gender
  const mapGender = (gender) => {
    if (!gender) return ''
    const g = gender.toLowerCase()
    if (g === 'm' || g === 'male') return 'Male'
    if (g === 'f' || g === 'female') return 'Female'
    return gender
  }

  // Validation functions
  const validatePassportNumber = (value) => {
    if (!value) return 'Passport number is required'
    // Indian passport format: 1-2 letters followed by 7-8 digits (e.g., A1234567, AB12345678)
    const passportRegex = /^[A-Z]{1,2}[0-9]{7,8}$/i
    if (!passportRegex.test(value)) {
      return 'Invalid passport number format (e.g., A1234567 or AB12345678)'
    }
    return ''
  }

  const validatePANNumber = (value) => {
    if (!value) return 'PAN number is required'
    // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i
    if (!panRegex.test(value)) {
      return 'Invalid PAN number format (e.g., ABCDE1234F)'
    }
    return ''
  }

  const validatePhoneNumber = (value) => {
    if (!value) return 'Phone number is required'
    // Remove spaces, dashes, and plus signs for validation
    const cleaned = value.replace(/[\s\-+]/g, '')
    // Indian mobile: 10 digits, can start with 0 or country code 91
    const phoneRegex = /^(\+91|91|0)?[6-9]\d{9}$/
    if (!phoneRegex.test(cleaned)) {
      return 'Invalid mobile number. Enter 10-digit mobile number (e.g., 9876543210)'
    }
    return ''
  }

  const handleUploadAndExtract = async () => {
    if (passportFiles.length === 0 || !panFile) {
      Swal.fire({
        icon: 'error',
        title: 'Documents Required',
        text: 'Please upload at least one Passport image and PAN Card document',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      return
    }

    setIsExtracting(true)
    
    try {
      const baseUrl = 'https://t9hr21z3-8000.inc1.devtunnels.ms'
      
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

      const response = await fetch(`${baseUrl}/api/v1/upload`, {
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
      
      // Store the upload response for later use in store API
      setUploadResponse(result)

      // Extract data from response structure
      // Response structure: { passport_urls: [...], pan_url: "...", extracted_data: { passport: {...}, pan: {...} } }
      const extractedDataFromAPI = result.extracted_data || {}
      const passportData = extractedDataFromAPI.passport || {}
      const panData = extractedDataFromAPI.pan || {}

      // Map passport data to form fields
      const extractedData = {
        passportNumber: passportData.passport_number || '',
        fullName: passportData.name || '', // This might be null, we'll handle it
        dateOfBirth: parseDate(passportData.dob),
        placeOfBirth: passportData.place_of_birth || '',
        nationality: passportData.nationality || '',
        gender: mapGender(passportData.sex),
        passportIssueDate: parseDate(passportData.date_of_issue),
        passportExpiryDate: parseDate(passportData.date_of_expiry),
        passportIssuePlace: passportData.place_of_issue || '',
        panNumber: panData.pan_number || '',
        panName: panData.name || '',
        panFatherName: panData.father_name || '',
        panDob: parseDate(panData.dob),
        address: passportData.address || '',
        passportFatherName: passportData.father_name || '',
        passportMotherName: passportData.mother_name || '',
        passportPinCode: passportData.pin_code || '',
        spouseName: passportData.spouse_name || '',
        fileNumber: passportData.file_number || '',
        oldPassportNumber: passportData.old_passport_number || '',
        oldPassportIssueDate: parseDate(passportData.old_passport_issue_date),
        oldPassportIssuePlace: passportData.old_passport_issue_place || '',
      }
      
      // If passport name is null, try to extract from raw_text
      if (!extractedData.fullName && passportData.raw_text) {
        const rawText = passportData.raw_text
        // Try multiple patterns to extract name
        let nameMatch = rawText.match(/(?:Given Name\(s\)|दिया गया नाम)\s*([A-Z\s]+)/i)
        if (!nameMatch) {
          // Try to find name after "Given Name(s)" or similar patterns
          nameMatch = rawText.match(/(?:Given Name|दिया गया नाम)[:\s]*([A-Z][A-Z\s]+?)(?:\n|$)/i)
        }
        if (!nameMatch) {
          // Try to extract from MRZ line (last line with < characters)
          const mrzMatch = rawText.match(/P<[A-Z]+<+([A-Z]+)<([A-Z]+)/)
          if (mrzMatch) {
            extractedData.fullName = `${mrzMatch[2]} ${mrzMatch[1]}`.trim()
          }
        } else {
          extractedData.fullName = nameMatch[1].trim()
        }
      }
      
      setFormData(prev => ({ ...prev, ...extractedData }))
      setIsDataExtracted(true)
      setIsExtracting(false)
      setCurrentStep(2)
      setNeedsRefetch(false) // Reset refetch flag after successful extraction
      // Clear validation errors when new data is extracted
      setValidationErrors({
        passportNumber: '',
        panNumber: '',
        phoneNumber: ''
      })
      
      Swal.fire({
        icon: 'success',
        title: 'Data extracted!',
        text: 'Please review and edit the extracted information',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    } catch (error) {
      console.error('Error extracting data:', error)
      setIsExtracting(false)
      
      Swal.fire({
        icon: 'error',
        title: 'Extraction Failed',
        text: error.message || 'Failed to extract data from documents. Please try again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Auto-format PAN number (uppercase, limit to 10 characters)
    if (name === 'panNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10)
    }
    
    // Auto-format Passport number (uppercase, alphanumeric)
    if (name === 'passportNumber' || name === 'oldPassportNumber') {
      processedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    }
    
    // Auto-format Phone number (digits, spaces, +, -)
    if (name === 'phoneNumber') {
      processedValue = value.replace(/[^\d+\-\s]/g, '')
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))

    // Real-time validation
    if (name === 'passportNumber') {
      setValidationErrors(prev => ({
        ...prev,
        passportNumber: validatePassportNumber(processedValue)
      }))
    } else if (name === 'panNumber') {
      setValidationErrors(prev => ({
        ...prev,
        panNumber: validatePANNumber(processedValue)
      }))
    } else if (name === 'phoneNumber') {
      setValidationErrors(prev => ({
        ...prev,
        phoneNumber: validatePhoneNumber(processedValue)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (passportFiles.length === 0 || !panFile) {
      Swal.fire({
        icon: 'error',
        title: 'Documents Required',
        text: 'Please upload at least one Passport image and PAN Card document',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      return
    }

    // Validate all required fields
    const passportError = validatePassportNumber(formData.passportNumber)
    const panError = validatePANNumber(formData.panNumber)
    const phoneError = validatePhoneNumber(formData.phoneNumber)
    
    setValidationErrors({
      passportNumber: passportError,
      panNumber: panError,
      phoneNumber: phoneError
    })

    if (!formData.passportNumber || !formData.fullName || !formData.panNumber || !formData.email || !formData.phoneNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill in all required fields',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      return
    }

    if (passportError || panError || phoneError) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please correct the validation errors before submitting',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
      return
    }

    setIsSubmitting(true)
    setCurrentStep(3)
    
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

      const baseUrl = 'https://t9hr21z3-8000.inc1.devtunnels.ms'

      // Get URLs from upload response
      // Response structure: { passport_urls: [...], pan_url: "...", extracted_data: {...} }
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

      const response = await fetch(`${baseUrl}/api/v1/store`, {
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
      
      setIsSubmitting(false)
      setShowSuccess(true)
      
      Swal.fire({
        icon: 'success',
        title: 'Application Submitted!',
        text: 'Your visa application has been submitted successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      })
      
      setTimeout(() => {
        setShowSuccess(false)
        setCurrentStep(1)
        setPassportFiles([])
        setPanFile(null)
        setIsDataExtracted(false)
        setUploadResponse(null)
        setFormData({
          passportNumber: '',
          fullName: '',
          dateOfBirth: '',
          placeOfBirth: '',
          nationality: '',
          gender: '',
          passportIssueDate: '',
          passportExpiryDate: '',
          passportIssuePlace: '',
          passportFatherName: '',
          passportMotherName: '',
          passportPinCode: '',
          panNumber: '',
          panName: '',
          panFatherName: '',
          panDob: '',
          email: '',
          phoneNumber: '',
          address: '',
        })
        // Clear validation errors
        setValidationErrors({
          passportNumber: '',
          panNumber: '',
          phoneNumber: ''
        })
      }, 3000)
    } catch (error) {
      console.error('Error submitting form:', error)
      setIsSubmitting(false)
      
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.message || 'Failed to submit application. Please try again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true
      })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e, type) => {
    e.preventDefault()
    e.stopPropagation()
    const files = e.dataTransfer.files
    if (type === 'passport' && files.length > 0) {
      // Filter valid files (only JPEG and PNG)
      const validFiles = Array.from(files).filter(file => 
        file.type === 'image/jpeg' || file.type === 'image/png'
      )
      if (validFiles.length > 0) {
        handleMultipleFileUpload(type, validFiles)
      }
    } else if (type === 'pan' && files.length > 0) {
      const file = files[0]
      if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        handleFileUpload(type, file)
      }
    }
  }

  const steps = [
    { number: 1, label: 'Upload Documents' },
    { number: 2, label: 'Review Information' },
    { number: 3, label: 'Submit Application' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Visa Application Portal</h1>
              <p className="mt-1 text-sm text-gray-600">Complete your visa application by uploading documents and filling the form</p>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Secure Portal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                {/* Step Circle and Label */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className={`hidden sm:block mt-2 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="h-0.5 mx-4 sm:mx-6 md:mx-8 bg-gray-300 relative w-[60px] sm:w-[70px] md:w-[100px] xl:w-[120px]" style={{maxWidth: '150px' }}>
                    <div className={`absolute inset-0 bg-blue-600 transition-all duration-500 ${
                      currentStep > step.number ? 'w-full' : 'w-0'
                    }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800">Application Submitted Successfully</p>
                <p className="text-xs text-green-700 mt-0.5">You will receive a confirmation email shortly</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {/* Document Upload Section */}
          <div className="p-6 sm:p-8 border-b border-gray-200">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-3">1</div>
              <h2 className="text-lg font-semibold text-gray-900">Upload Required Documents</h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Passport Upload */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passport Copy <span className="text-red-600">*</span>
                  <span className="text-xs text-gray-500 ml-2">(Max 2 images)</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all flex-1 flex flex-col justify-center min-h-[240px] ${
                    passportFiles.length > 0
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'passport')}
                >
                  {passportFiles.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="space-y-2">
                        {passportFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                            <div className="flex items-center flex-1 min-w-0">
                              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-sm font-medium text-gray-900 truncate flex-1">{file.name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFileRemove('passport', index)}
                              className="ml-2 text-red-600 hover:text-red-700 flex-shrink-0"
                              title="Remove file"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                      {passportFiles.length < 2 && (
                        <label className="cursor-pointer inline-block mt-2">
                          <span className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors inline-block">
                            Add Another Image
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png"
                            multiple
                            onChange={(e) => e.target.files && e.target.files.length > 0 && handleMultipleFileUpload('passport', e.target.files)}
                          />
                        </label>
                      )}
                      {passportFiles.length >= 2 && (
                        <p className="text-xs text-gray-500 mt-2">Maximum 2 passport images uploaded</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-700 mb-1">Drag and drop your file here</p>
                      <p className="text-xs text-gray-500 mb-3">or</p>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          Browse Files
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png"
                          multiple
                          onChange={(e) => e.target.files && e.target.files.length > 0 && handleMultipleFileUpload('passport', e.target.files)}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-3">Supported formats: JPEG, PNG (Max 5MB, Max 2 images - select multiple at once)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PAN Card Upload */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Card Copy <span className="text-red-600">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all flex-1 flex flex-col justify-center min-h-[240px] ${
                    panFile
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'pan')}
                >
                  {panFile ? (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{panFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">File uploaded successfully</p>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleFileRemove('pan')}
                          className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                        >
                          Remove File
                        </button>
                        <label className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors inline-block">
                            Change File
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/png"
                            onChange={(e) => e.target.files[0] && handleFileUpload('pan', e.target.files[0])}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-700 mb-1">Drag and drop your file here</p>
                      <p className="text-xs text-gray-500 mb-3">or</p>
                      <label className="cursor-pointer">
                        <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                          Browse Files
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/jpeg,image/png"
                          onChange={(e) => e.target.files[0] && handleFileUpload('pan', e.target.files[0])}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-3">Supported formats: JPEG, PNG (Max 5MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Go to Next Step Button */}
            {passportFiles.length > 0 && panFile && !isDataExtracted && (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-sm text-gray-600 mb-4 text-center">
                  Both documents have been uploaded successfully. Click below to proceed to the next step and review your information.
                </p>
                <button
                  type="button"
                  onClick={handleUploadAndExtract}
                  disabled={isExtracting}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isExtracting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Go to Next Step
                    </>
                  )}
                </button>
              </div>
            )}

            {isDataExtracted && !needsRefetch && (
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Data Extracted Successfully</p>
                    <p className="text-xs text-blue-700 mt-0.5">Please review the information below and make any necessary corrections</p>
                  </div>
                </div>
              </div>
            )}

            {/* Show message when files are changed/removed and need re-fetch */}
            {needsRefetch && currentStep >= 2 && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800">Documents Changed</p>
                    <p className="text-xs text-yellow-700 mt-0.5">
                      {passportFiles.length === 0 || !panFile 
                        ? 'Please upload the required documents to extract data again.'
                        : 'Click the button below to extract data from the updated documents.'}
                    </p>
                    {passportFiles.length > 0 && panFile && (
                      <button
                        type="button"
                        onClick={handleUploadAndExtract}
                        disabled={isExtracting}
                        className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isExtracting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Extracting Data...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Extract Data Again
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Section */}
          {(isDataExtracted || (currentStep >= 2 && isExtracting)) && (
            <>
              {/* Show loader overlay when extracting */}
              {isExtracting && (
                <div className="p-6 sm:p-8 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col items-center justify-center py-12">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm font-medium text-gray-700">Extracting data from documents...</p>
                    <p className="text-xs text-gray-500 mt-1">Please wait while we process your documents</p>
                  </div>
                </div>
              )}

              {/* Passport Details */}
              {isDataExtracted && !isExtracting && (
                <div className="p-6 sm:p-8 border-b border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-3">2</div>
                  <h2 className="text-lg font-semibold text-gray-900">Passport Information</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Passport Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="passportNumber"
                      value={formData.passportNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.passportNumber 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="e.g., A1234567"
                      required
                    />
                    {validationErrors.passportNumber && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.passportNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Place of Birth
                    </label>
                    <input
                      type="text"
                      name="placeOfBirth"
                      value={formData.placeOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nationality <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Gender <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="passportIssueDate"
                      value={formData.passportIssueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Expiry Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      name="passportExpiryDate"
                      value={formData.passportExpiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Place of Issue
                    </label>
                    <input
                      type="text"
                      name="passportIssuePlace"
                      value={formData.passportIssuePlace}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      name="passportPinCode"
                      value={formData.passportPinCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      maxLength="6"
                      pattern="[0-9]{6}"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="passportFatherName"
                      value={formData.passportFatherName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      name="passportMotherName"
                      value={formData.passportMotherName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Spouse Name
                    </label>
                    <input
                      type="text"
                      name="spouseName"
                      value={formData.spouseName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      File Number
                    </label>
                    <input
                      type="text"
                      name="fileNumber"
                      value={formData.fileNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Old Passport Number
                    </label>
                    <input
                      type="text"
                      name="oldPassportNumber"
                      value={formData.oldPassportNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., A1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Old Passport Issue Date
                    </label>
                    <input
                      type="date"
                      name="oldPassportIssueDate"
                      value={formData.oldPassportIssueDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Old Passport Issue Place
                    </label>
                    <input
                      type="text"
                      name="oldPassportIssuePlace"
                      value={formData.oldPassportIssuePlace}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                </div>
              </div>
              )}

              {/* PAN Card Details */}
              {isDataExtracted && !isExtracting && (
                <div className="p-6 sm:p-8 border-b border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-3">3</div>
                  <h2 className="text-lg font-semibold text-gray-900">PAN Card Information</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      PAN Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md text-sm uppercase focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.panNumber 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      maxLength="10"
                      placeholder="e.g., ABCDE1234F"
                      required
                    />
                    {validationErrors.panNumber && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.panNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Name on PAN Card
                    </label>
                    <input
                      type="text"
                      name="panName"
                      value={formData.panName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="panDob"
                      value={formData.panDob}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="panFatherName"
                      value={formData.panFatherName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Additional Information */}
              {isDataExtracted && !isExtracting && (
                <div className="p-6 sm:p-8 border-b border-gray-200">
                <div className="flex items-center mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-semibold mr-3">4</div>
                  <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.phoneNumber 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300'
                      }`}
                      placeholder="e.g., 9876543210 or +91 9876543210"
                      maxLength="15"
                      required
                    />
                    {validationErrors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-600">{validationErrors.phoneNumber}</p>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Residential Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              )}

              {/* Submit Section */}
              {isDataExtracted && !isExtracting && (
                <div className="p-6 sm:p-8 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-gray-600">
                      By submitting this application, you confirm that all information provided is accurate and complete
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Application
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
              )}
            </>
          )}
        </form>

        {/* Footer Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team at <a href="mailto:support@visaportal.com" className="text-blue-600 hover:underline">support@visaportal.com</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home