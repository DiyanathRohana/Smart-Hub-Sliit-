import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import './styles/MaintenanceTicketCreation.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089/api/v1';

function MaintenanceTicketCreation() {
  const [resourceOptions, setResourceOptions] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [resourceError, setResourceError] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState('');
  const [ticketError, setTicketError] = useState('');

  const [form, setForm] = useState({
    resource: '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    contact: ''
  });
  const [status, setStatus] = useState('OPEN');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [uploadSlots, setUploadSlots] = useState([null, null, null]);

  const userRole = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) {
        return '';
      }
      const parsed = JSON.parse(rawUser);
      return (parsed?.role || '').toString().trim().toUpperCase();
    } catch (error) {
      return '';
    }
  }, []);

  const isTechnician = userRole === 'TECHNICIAN' || userRole === 'ROLE_TECHNICIAN';

  useEffect(() => {
    let isMounted = true;

    axios
      .get(`${API_URL}/facility-assets/getall`, { withCredentials: true })
      .then((res) => {
        if (!isMounted) {
          return;
        }
        const list = Array.isArray(res.data) ? res.data : (res.data.facilityAssets || []);
        const normalized = list
          .map((item) => ({
            id: item._id,
            title: (item.title || '').trim()
          }))
          .filter((item) => item.id && item.title)
          .sort((a, b) => a.title.localeCompare(b.title));

        setResourceOptions(normalized);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        setResourceError('Unable to load asset names right now.');
      })
      .finally(() => {
        if (isMounted) {
          setLoadingResources(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });

  const handleSlotUpload = async (index, file) => {
    if (!file) {
      return;
    }

    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const lowerName = (file.name || '').toLowerCase();
    const hasAllowedExtension = lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg');
    if (!allowedMimeTypes.includes(file.type) && !hasAllowedExtension) {
      setTicketError('Only PNG and JPEG images are allowed.');
      return;
    }

    let imageDataUrl = '';
    try {
      imageDataUrl = await readFileAsDataUrl(file);
    } catch {
      setTicketError('Unable to read selected image. Please try another file.');
      return;
    }
    setUploadSlots((prev) => {
      const next = [...prev];
      next[index] = {
        fileName: file.name,
        imageDataUrl
      };
      return next;
    });
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketSuccess('');
    setTicketError('');

    if (!form.resource) {
      setTicketError('Please select a Resource / Location.');
      return;
    }
    if (!form.category) {
      setTicketError('Please select a category.');
      return;
    }
    if (!form.description.trim()) {
      setTicketError('Please enter a description for the issue.');
      return;
    }
    if (!form.contact.trim()) {
      setTicketError('Please provide contact details.');
      return;
    }

    const user = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();

    const payload = {
      resource: form.resource,
      category: form.category,
      description: form.description.trim(),
      priority: form.priority,
      contact: form.contact.trim(),
      status,
      technicianResolutionNotes: resolutionNotes.trim(),
      images: uploadSlots.filter(Boolean).map((slot) => slot.imageDataUrl || slot.fileName),
      requesterId: user.userId || null,
      requesterName: user.username || user.name || user.email || 'Unknown User',
      createdAt: new Date().toISOString()
    };

    setSubmittingTicket(true);
    try {
      await axios.post(`${API_URL}/maintenance-tickets`, payload, { withCredentials: true });
      setTicketSuccess('Maintenance ticket submitted successfully.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to submit maintenance ticket.';
      setTicketError(message);
      setSubmittingTicket(false);
      return;
    }

    setForm({ resource: '', category: '', description: '', priority: 'MEDIUM', contact: '' });
    setUploadSlots([null, null, null]);
    setStatus('OPEN');
    setResolutionNotes('');
    setSubmittingTicket(false);
  };

  return (
    <div className="sc-ticket-page">
      <div className="sc-ticket-card">
        <div className="sc-ticket-header">
          <div>
            <h1 className="sc-ticket-title">Maintenance Ticket Creation</h1>
            <p className="sc-ticket-subtitle">Log incidents and streamline technician updates in one enterprise form.</p>
          </div>
          <span className="sc-ticket-badge">Smart Hub</span>
        </div>

        <form className="sc-ticket-form" onSubmit={handleTicketSubmit}>
          {ticketSuccess && <div className="sc-ticket-notice sc-ticket-notice-success">{ticketSuccess}</div>}
          {ticketError && <div className="sc-ticket-notice sc-ticket-notice-error">{ticketError}</div>}

          <div className="sc-ticket-grid">
            <div className="sc-ticket-field">
              <label htmlFor="resource" className="sc-ticket-label">Resource / Location</label>
              <select
                id="resource"
                name="resource"
                className="sc-ticket-input"
                value={form.resource}
                onChange={handleFieldChange}
                disabled={loadingResources}
              >
                <option value="">
                  {loadingResources
                    ? 'Loading assets...'
                    : 'Select resource or location'}
                </option>
                {resourceOptions.map((item) => (
                  <option key={item.id} value={item.title}>{item.title}</option>
                ))}
              </select>
              {!loadingResources && resourceOptions.length === 0 && !resourceError && (
                <small className="sc-ticket-helper">No assets found. Ask admin to add assets first.</small>
              )}
              {resourceError && <small className="sc-ticket-helper sc-ticket-helper-error">{resourceError}</small>}
            </div>

            <div className="sc-ticket-field">
              <label htmlFor="category" className="sc-ticket-label">Category</label>
              <select
                id="category"
                name="category"
                className="sc-ticket-input"
                value={form.category}
                onChange={handleFieldChange}
              >
                <option value="">Select category</option>
                <option value="HARDWARE">Hardware</option>
                <option value="SOFTWARE">Software</option>
                <option value="ELECTRICAL">Electrical</option>
              </select>
            </div>
          </div>

          <div className="sc-ticket-field">
            <label htmlFor="description" className="sc-ticket-label">Description</label>
            <textarea
              id="description"
              name="description"
              className="sc-ticket-input sc-ticket-textarea"
              value={form.description}
              onChange={handleFieldChange}
              placeholder="Describe the issue details"
            />
          </div>

          <div className="sc-ticket-grid">
            <div className="sc-ticket-field">
              <label className="sc-ticket-label">Priority Level</label>
              <div className="sc-priority-row" role="radiogroup" aria-label="Priority Level">
                <button
                  type="button"
                  className={`sc-priority-chip sc-priority-low ${form.priority === 'LOW' ? 'active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, priority: 'LOW' }))}
                >
                  Low
                </button>
                <button
                  type="button"
                  className={`sc-priority-chip sc-priority-medium ${form.priority === 'MEDIUM' ? 'active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, priority: 'MEDIUM' }))}
                >
                  Medium
                </button>
                <button
                  type="button"
                  className={`sc-priority-chip sc-priority-high ${form.priority === 'HIGH' ? 'active' : ''}`}
                  onClick={() => setForm((prev) => ({ ...prev, priority: 'HIGH' }))}
                >
                  High
                </button>
              </div>
            </div>

            <div className="sc-ticket-field">
              <label htmlFor="contact" className="sc-ticket-label">Contact Details</label>
              <input
                id="contact"
                name="contact"
                className="sc-ticket-input"
                value={form.contact}
                onChange={handleFieldChange}
                placeholder="Phone number or email"
              />
            </div>
          </div>

          <div className="sc-ticket-side-grid">
            <section className="sc-ticket-panel">
              <h2 className="sc-ticket-panel-title">Image Upload</h2>
              <p className="sc-ticket-panel-subtitle">Attach issue evidence (drag and drop supported)</p>
              <div className="sc-upload-grid">
                {uploadSlots.map((slot, index) => (
                  <label key={index} className="sc-upload-slot">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                      className="sc-upload-input"
                      onChange={(e) => void handleSlotUpload(index, e.target.files?.[0])}
                    />
                    {slot?.imageDataUrl ? (
                      <>
                        <img src={slot.imageDataUrl} alt={slot.fileName} className="sc-upload-preview" />
                        <span className="sc-upload-file-name">{slot.fileName}</span>
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg"></i>
                        <span>Drop image or click to upload</span>
                      </>
                    )}
                  </label>
                ))}
              </div>
            </section>

            <section className="sc-ticket-panel">
              <h2 className="sc-ticket-panel-title">Technician Resolution</h2>
              <p className="sc-ticket-panel-subtitle">
                {isTechnician
                  ? 'Track and update maintenance progress'
                  : 'Read-only: only Technician users can update this section.'}
              </p>

              <div className="sc-ticket-field">
                <label className="sc-ticket-label">Status</label>
                <div className="sc-status-toggle" role="radiogroup" aria-label="Ticket Status">
                  {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((state) => (
                    <button
                      key={state}
                      type="button"
                      className={`sc-status-chip ${status === state ? 'active' : ''}`}
                      onClick={() => setStatus(state)}
                      disabled={!isTechnician}
                    >
                      {state === 'OPEN' ? 'Open' : state === 'IN_PROGRESS' ? 'In-Progress' : 'Resolved'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sc-ticket-field">
                <label htmlFor="resolutionNotes" className="sc-ticket-label">Technician Resolution Notes</label>
                <textarea
                  id="resolutionNotes"
                  className="sc-ticket-input sc-ticket-textarea"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Write the action taken, parts replaced, or follow-up notes"
                  disabled={!isTechnician}
                />
              </div>

              <button type="button" className="sc-ticket-update-btn" disabled={!isTechnician}>Update Status</button>
            </section>
          </div>

          <div className="sc-ticket-submit-row">
            <button type="submit" className="sc-ticket-submit-btn" disabled={submittingTicket}>
              {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default MaintenanceTicketCreation;
