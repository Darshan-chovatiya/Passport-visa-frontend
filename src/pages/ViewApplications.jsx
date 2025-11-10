import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ArrowLeft, Search, Loader2, FileText, Eye, X, FileCheck, CreditCard, Mail, Loader, Trash2 } from 'lucide-react'
import { getDocuments, getDocumentById, deleteDocument } from '../services/api'

function ViewApplications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
    page: 1,
    page_size: 10
  })
  const searchTimeoutRef = useRef(null)
  const prevSearchQueryRef = useRef('')
  const prevPageRef = useRef(1)

  // Fetch applications list
  const fetchApplications = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const data = await getDocuments(page, pageSize, search)
      setApplications(data.documents || [])
      setPagination({
        total: data.total || 0,
        total_pages: data.total_pages || 0,
        page: data.page || 1,
        page_size: data.page_size || 3
      })
    } catch (error) {
      console.error('Error fetching applications:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load applications. Please try again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch application details
  const fetchApplicationDetails = async (documentId) => {
    try {
      setLoadingDetails(true)
      const data = await getDocumentById(documentId)
      setSelectedApplication(data)
      setShowModal(true)
    } catch (error) {
      console.error('Error fetching application details:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load application details. Please try again.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      })
    } finally {
      setLoadingDetails(false)
    }
  }

  // Handle search changes with debouncing - reset to page 1 when search changes
  useEffect(() => {
    // Check if search actually changed
    const searchChanged = searchQuery !== prevSearchQueryRef.current
    
    if (searchChanged) {
      // Clear any existing timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      
      // Debounce search and reset to page 1
      searchTimeoutRef.current = setTimeout(() => {
        prevSearchQueryRef.current = searchQuery
        if (currentPage !== 1) {
          setCurrentPage(1)
        } else {
          // Already on page 1, fetch directly
          fetchApplications(1, searchQuery)
        }
      }, 700)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Fetch data when page changes (but not when search is being debounced)
  useEffect(() => {
    // Check if page changed (not from search reset)
    const pageChanged = currentPage !== prevPageRef.current
    const searchChanged = searchQuery !== prevSearchQueryRef.current
    
    // Only fetch if:
    // 1. Page changed AND search hasn't changed (user clicked pagination)
    // 2. OR we're on initial mount
    if (pageChanged && !searchChanged) {
      prevPageRef.current = currentPage
      fetchApplications(currentPage, searchQuery)
    } else if (pageChanged && searchChanged && currentPage === 1) {
      // Page was reset to 1 due to search change - fetch after debounce
      prevPageRef.current = currentPage
      const timeoutId = setTimeout(() => {
        fetchApplications(1, searchQuery)
      }, 50) // Small delay to ensure search ref is updated
      
      return () => clearTimeout(timeoutId)
    }
  }, [currentPage, searchQuery])

  // Initial fetch on mount
  useEffect(() => {
    prevPageRef.current = 1
    prevSearchQueryRef.current = ''
    fetchApplications(1, '')
  }, [])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  // Format date for display (DD/MM/YYYY)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      // Handle DD/MM/YYYY format
      if (dateString.includes('/')) {
        return dateString
      }
      const date = new Date(dateString)
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    } catch {
      return dateString
    }
  }

  const handleViewDetails = (application) => {
    fetchApplicationDetails(application.id)
  }

  const handleDelete = async (application) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete the profile for ${application.name || 'this application'}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (result.isConfirmed) {
      try {
        await deleteDocument(application.id)
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Profile has been deleted successfully.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })

        // Refresh the applications list
        // If we're on a page that might become empty after deletion, go to previous page
        const remainingCount = applications.length - 1
        if (remainingCount === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1)
        } else {
          fetchApplications(currentPage, searchQuery)
        }
      } catch (error) {
        console.error('Error deleting application:', error)
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete profile. Please try again.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        })
      }
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="sm:flex items-center justify-between ">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Visa Profile</h1>
              <p className="mt-1 text-sm text-gray-600">View and manage all visa Profile</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-3 sm:mt-0 w-full justify-center sm:w-fit inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, passport number, PAN number, email, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
              <p className="text-sm font-medium text-gray-700">Loading Profile...</p>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12">
            <div className="flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-1">No Profile found</p>
              <p className="text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search query' : 'No Profile have been submitted yet'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Applications Table */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passport Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        PAN Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Uploaded At
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{app.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.passport_number || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.pan_number || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{app.mobileNo || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(app.uploaded_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(app)}
                              className="text-blue-600 cursor-pointer hover:text-blue-900 inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(app)}
                              className="text-red-600 cursor-pointer hover:text-red-900 inline-flex items-center justify-center p-2 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, pagination.total)}</span> of{' '}
                  <span className="font-medium">{pagination.total}</span> Profile
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                      let pageNum
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.total_pages - 2) {
                        pageNum = pagination.total_pages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border rounded-md text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.total_pages}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 bg-[#0c0c0c30]">
            {/* Background overlay */}
            {/* <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowModal(false)}
            ></div> */}

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Profile Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
                    <p className="text-sm font-medium text-gray-700">Loading details...</p>
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Passport Information */}
                    {selectedApplication.extracted_data?.passport && (
                      <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                          <FileCheck className="w-5 h-5 mr-2 text-blue-600" />
                          Passport Information
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Passport Number</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.passport_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDateDisplay(selectedApplication.extracted_data.passport.dob)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Nationality</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.nationality || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Gender</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.sex || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Place of Birth</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.place_of_birth || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Issue Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDateDisplay(selectedApplication.extracted_data.passport.date_of_issue)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Expiry Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDateDisplay(selectedApplication.extracted_data.passport.date_of_expiry)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Place of Issue</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.place_of_issue || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">PIN Code</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.pin_code || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Father's Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.father_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Mother's Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.mother_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Spouse Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.spouse_name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">File Number</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.file_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Old Passport Number</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.old_passport_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Old Passport Issue Date</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDateDisplay(selectedApplication.extracted_data.passport.old_passport_issue_date)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Old Passport Issue Place</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.old_passport_issue_place || 'N/A'}</p>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.passport.address || 'N/A'}</p>
                          </div>
                          {selectedApplication.passport_urls && selectedApplication.passport_urls.length > 0 && (
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Passport Images</label>
                              <div className="flex flex-wrap gap-2">
                                {selectedApplication.passport_urls.map((url, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                  >
                                    <img
                                      src={url}
                                      alt={`Passport ${index + 1}`}
                                      className="h-24 w-auto border border-gray-300 rounded hover:border-blue-500 transition-colors"
                                    />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PAN Card Information */}
                    {selectedApplication.extracted_data?.pan && (
                      <div className="border-b border-gray-200 pb-6">
                        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                          <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                          PAN Card Information
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">PAN Number</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.pan.pan_number || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.pan.name || 'N/A'}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Date of Birth</label>
                            <p className="mt-1 text-sm text-gray-900">{formatDateDisplay(selectedApplication.extracted_data.pan.dob)}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 uppercase">Father's Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedApplication.extracted_data.pan.father_name || 'N/A'}</p>
                          </div>
                          {selectedApplication.pan_url && (
                            <div className="sm:col-span-2">
                              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">PAN Card Image</label>
                              <a
                                href={selectedApplication.pan_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block"
                              >
                                <img
                                  src={selectedApplication.pan_url}
                                  alt="PAN Card"
                                  className="h-32 w-auto border border-gray-300 rounded hover:border-blue-500 transition-colors"
                                />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedApplication.email || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Mobile Number</label>
                          <p className="mt-1 text-sm text-gray-900">{selectedApplication.mobileNo || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">Uploaded At</label>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedApplication.uploaded_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewApplications

