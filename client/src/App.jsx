import { useState } from 'react';
import { supabase } from './supabaseClient';

const initialFormState = {
  clientName: '',
  componentType: '',
  product: '',
  version: '',
  patch: '',
  architectures: '',
  certified: '',
  releaseVersion: '',
  supportStatus: '',
  notes: '',
  coreComponent: '',
  subApplication: '',
  versionDetails: '',
  vcpu: '',
  ram: '',
  storage: ''
};

function App() {
  const [formData, setFormData] = useState(initialFormState);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('OFSAA_stack')
        .insert([formData]);

      if (error) throw error;

      showNotification('Record created successfully', 'success');
      resetForm();
    } catch (error) {
      showNotification('Error saving record: ' + error.message, 'error');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="app-container">
      {notification && (
        <div className={`notification ${notification.type}`} style={{
          position: 'fixed', top: '20px', right: '20px',
          background: notification.type === 'error' ? '#ef4444' : '#10b981',
          color: 'white', padding: '1rem', borderRadius: '8px', zIndex: 1000
        }}>
          {notification.message}
        </div>
      )}

      <header className="title-bar">
        <div>
          <h1>OFSAA Unified Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Add new stack and component data efficiently.</p>
        </div>
      </header>

      <div className="glass-panel">
        <h2 style={{ marginBottom: '1.5rem' }}>Add New Record</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label>Client Name</label>
            <input name="clientName" value={formData.clientName} onChange={handleInputChange} placeholder="e.g. Client X" autoFocus />
          </div>

          <h3 style={{ marginTop: '1rem', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Stack Information</h3>
          <div className="form-grid">
            <div>
              <label>Component Type</label>
              <input name="componentType" value={formData.componentType} onChange={handleInputChange} placeholder="e.g. Operating System" />
            </div>
            <div>
              <label>Product</label>
              <input name="product" value={formData.product} onChange={handleInputChange} placeholder="e.g. Oracle Solaris" />
            </div>
            <div>
              <label>Version</label>
              <input name="version" value={formData.version} onChange={handleInputChange} placeholder="e.g. 11.4" />
            </div>
            <div>
              <label>Patch / PSU/RU</label>
              <input name="patch" value={formData.patch} onChange={handleInputChange} />
            </div>
            <div>
              <label>Certified</label>
              <select name="certified" value={formData.certified} onChange={handleInputChange}>
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label>Support Status</label>
              <select name="supportStatus" value={formData.supportStatus} onChange={handleInputChange}>
                <option value="">Select...</option>
                <option value="Supported">Supported</option>
                <option value="Sustaining Support">Sustaining Support</option>
                <option value="Not Supported">Not Supported</option>
              </select>
            </div>
          </div>

          <h3 style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Component Details</h3>
          <div className="form-grid">
            <div>
              <label>Core Component</label>
              <input name="coreComponent" value={formData.coreComponent} onChange={handleInputChange} />
            </div>
            <div>
              <label>Sub Application</label>
              <input name="subApplication" value={formData.subApplication} onChange={handleInputChange} />
            </div>
            <div>
              <label>Version Details</label>
              <input name="versionDetails" value={formData.versionDetails} onChange={handleInputChange} />
            </div>
            <div>
              <label>vCPU</label>
              <input name="vcpu" value={formData.vcpu} onChange={handleInputChange} />
            </div>
            <div>
              <label>RAM</label>
              <input name="ram" value={formData.ram} onChange={handleInputChange} />
            </div>
            <div>
              <label>Storage</label>
              <input name="storage" value={formData.storage} onChange={handleInputChange} />
            </div>

            <div className="full-width">
              <label>Notes / Remarks</label>
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="3"></textarea>
            </div>
          </div>

          <div className="action-bar">
            <button type="submit" className="btn-primary">
              Save Record
            </button>
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
